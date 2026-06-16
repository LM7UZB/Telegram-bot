// Tilla va kumush narxlari ($/gramm) — JAHON BOZORI spot narxidan hisoblanadi.
//
// Mantiq:
//   spot (XAU $/untsiya) / 31.1035 = 999 tilla $/gramm
//   har proba sotish narxi = (spot $/g) * (proba/1000)
//   sotib olish narxi      = sotish - 10$ (tilla),  sotish - 0.3$ (kumush)
//   Shanba/Yakshanba (bozor yopiq) — oxirgi saqlangan narx ko'rsatiladi.
//
// Ustuvorlik: 1) Admin qo'lda (KV)  2) Jahon bozori (spot)  3) Oxirgi kesh  4) Zaxira
//
// Admin:
//   POST {action:'save', rates:[...]}   — qo'lda narx (hammaga ko'rinadi)
//   POST {action:'clear'}               — qo'lda narxni o'chirib, avtomatikka qaytaradi
//
// Tekshirish: /api/metal-rates?debug=1

import { kvGetJSON, kvSetJSON, kvConfigured } from './_kv.js';
import { validateInitData, isAdminUser } from './_auth.js';

const OVERRIDE_KEY = 'metalrates:override:v1';
const AUTO_CACHE_KEY = 'metalrates:auto:v1';
const OZ_TO_GRAM = 31.1034768;

// Sotib olish marjasi (env bilan moslash mumkin)
const GOLD_BUY_MARGIN = Number(process.env.METAL_GOLD_BUY_MARGIN) || 10;     // $/g
const SILVER_BUY_MARGIN = Number(process.env.METAL_SILVER_BUY_MARGIN) || 0.3; // $/g

const GOLD_PROBAS = [
  { id: 'g585', proba: '583 / 585', factor: 0.585 },
  { id: 'g750', proba: '750 (18K)', factor: 0.75 },
  { id: 'g916', proba: '916 (22K)', factor: 0.916 },
  { id: 'g999', proba: "999 (Bug'doy)", factor: 0.999 },
];
const SILVER_PROBAS = [
  { id: 's925', proba: '925 (Kumush)', factor: 0.925 },
  { id: 's999', proba: '999 (Chorva)', factor: 0.999 },
];

// Zaxira (spot ham, kesh ham bo'lmasa)
const DEFAULT_RATES = [
  { id: 'g585', metal: 'gold', proba: '583 / 585', sellPrice: 81, buyPrice: 71 },
  { id: 'g750', metal: 'gold', proba: '750 (18K)', sellPrice: 104, buyPrice: 94 },
  { id: 'g916', metal: 'gold', proba: '916 (22K)', sellPrice: 128, buyPrice: 118 },
  { id: 'g999', metal: 'gold', proba: "999 (Bug'doy)", sellPrice: 139, buyPrice: 129 },
  { id: 's925', metal: 'silver', proba: '925 (Kumush)', sellPrice: 1.6, buyPrice: 1.3 },
  { id: 's999', metal: 'silver', proba: '999 (Chorva)', sellPrice: 1.7, buyPrice: 1.4 },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
};
const PROXIES = [
  (u) => u,
  (u) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
];

const round2 = (n) => Math.round(n * 100) / 100;
const plausibleGoldOz = (n) => Number.isFinite(n) && n > 800 && n < 12000;
const plausibleSilverOz = (n) => Number.isFinite(n) && n > 3 && n < 300;

async function fetchJsonAny(url) {
  for (const wrap of PROXIES) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 7000);
      const r = await fetch(wrap(url), { headers: HEADERS, redirect: 'follow', signal: ctrl.signal });
      clearTimeout(timer);
      if (!r.ok) continue;
      const text = await r.text();
      try { return JSON.parse(text); } catch { /* keyingi */ }
    } catch { /* keyingi proksi */ }
  }
  return null;
}

// Jahon bozori spot narxlari ($/untsiya): { gold, silver }
async function fetchSpot() {
  // Manba 1: gold-api.com
  try {
    const [g, s] = await Promise.all([
      fetchJsonAny('https://api.gold-api.com/price/XAU'),
      fetchJsonAny('https://api.gold-api.com/price/XAG'),
    ]);
    const gold = Number(g?.price);
    const silver = Number(s?.price);
    if (plausibleGoldOz(gold)) return { gold, silver: plausibleSilverOz(silver) ? silver : null, src: 'gold-api.com' };
  } catch { /* keyingi manba */ }

  // Manba 2: goldprice.org
  try {
    const d = await fetchJsonAny('https://data-asg.goldprice.org/dbXRates/USD');
    const item = d?.items?.[0];
    const gold = Number(item?.xauPrice);
    const silver = Number(item?.xagPrice);
    if (plausibleGoldOz(gold)) return { gold, silver: plausibleSilverOz(silver) ? silver : null, src: 'goldprice.org' };
  } catch { /* zaxira */ }

  return null;
}

function computeRates(spot) {
  const goldPerGram = spot.gold / OZ_TO_GRAM;
  const rates = GOLD_PROBAS.map((p) => {
    const sell = Math.round(goldPerGram * p.factor); // tilla — butun $
    return { id: p.id, metal: 'gold', proba: p.proba, sellPrice: sell, buyPrice: Math.max(0, sell - GOLD_BUY_MARGIN) };
  });
  if (spot.silver) {
    const silverPerGram = spot.silver / OZ_TO_GRAM;
    for (const p of SILVER_PROBAS) {
      const sell = round2(silverPerGram * p.factor);
      rates.push({ id: p.id, metal: 'silver', proba: p.proba, sellPrice: sell, buyPrice: Math.max(0, round2(sell - SILVER_BUY_MARGIN)) });
    }
  } else {
    rates.push(...DEFAULT_RATES.filter((r) => r.metal === 'silver'));
  }
  return rates;
}

// Toshkent vaqti bo'yicha dam olish kuni (Shanba/Yakshanba)
function isWeekend() {
  const day = new Date(Date.now() + 5 * 3600 * 1000).getUTCDay();
  return day === 6 || day === 0;
}

function sanitizeRates(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((r) => ({
      id: String(r?.id || '').slice(0, 16),
      metal: r?.metal === 'silver' ? 'silver' : 'gold',
      proba: String(r?.proba || '').slice(0, 32),
      sellPrice: Number(r?.sellPrice),
      buyPrice: Number(r?.buyPrice),
    }))
    .filter((r) => r.id && r.proba && Number.isFinite(r.sellPrice) && Number.isFinite(r.buyPrice))
    .slice(0, 20);
}

export default async function handler(req, res) {
  // --- Admin: qo'lda saqlash / o'chirish ---
  if (req.method === 'POST') {
    if (!kvConfigured()) return res.status(500).json({ ok: false, error: 'Baza ulanmagan (KV)' });
    const user = validateInitData(req.headers['x-telegram-init-data'], process.env.BOT_TOKEN);
    if (!isAdminUser(user)) return res.status(403).json({ ok: false, error: 'Faqat admin tahrirlay oladi' });
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    try {
      if (body?.action === 'clear') {
        await kvSetJSON(OVERRIDE_KEY, null);
        return res.status(200).json({ ok: true, cleared: true });
      }
      const rates = sanitizeRates(body?.rates);
      if (rates.length === 0) return res.status(400).json({ ok: false, error: "Narxlar bo'sh" });
      const payload = { rates, updatedAt: new Date().toISOString() };
      await kvSetJSON(OVERRIDE_KEY, payload);
      return res.status(200).json({ ok: true, source: 'admin', ...payload });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  }

  const debug = req.query?.debug === '1' || req.query?.debug === 'true';

  // 1) Admin qo'lda kiritgan narxlar (ustuvor)
  if (!debug && kvConfigured()) {
    try {
      const ov = await kvGetJSON(OVERRIDE_KEY, null);
      if (ov && Array.isArray(ov.rates) && ov.rates.length) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ ok: true, source: 'admin', updatedAt: ov.updatedAt, rates: ov.rates });
      }
    } catch { /* davom */ }
  }

  const cached = kvConfigured() ? await kvGetJSON(AUTO_CACHE_KEY, null).catch(() => null) : null;

  // 2) Dam olish kuni — oxirgi saqlangan narxni ko'rsatamiz (bozor yopiq)
  if (!debug && isWeekend() && cached && Array.isArray(cached.rates) && cached.rates.length) {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ ok: true, source: 'market-weekend', updatedAt: cached.updatedAt, rates: cached.rates });
  }

  // 3) Jahon bozori spot narxi
  try {
    const spot = await fetchSpot();
    if (spot) {
      const rates = computeRates(spot);
      const payload = { rates, updatedAt: new Date().toISOString(), spot };
      if (kvConfigured()) { try { await kvSetJSON(AUTO_CACHE_KEY, payload); } catch { /* keshlamasa ham mayli */ } }
      if (debug) return res.status(200).json({ ok: true, debug: true, source: spot.src, spot, goldPerGram: round2(spot.gold / OZ_TO_GRAM), rates });
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400'); // 1 soat
      return res.status(200).json({ ok: true, source: 'market', updatedAt: payload.updatedAt, rates });
    }
    if (debug) return res.status(200).json({ ok: false, debug: true, note: 'spot narx olinmadi', cached });
  } catch (e) {
    if (debug) return res.status(200).json({ ok: false, debug: true, error: String(e) });
  }

  // 4) Oxirgi kesh, bo'lmasa zaxira
  if (cached && Array.isArray(cached.rates) && cached.rates.length) {
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json({ ok: true, source: 'market-cached', updatedAt: cached.updatedAt, rates: cached.rates });
  }
  res.setHeader('Cache-Control', 's-maxage=300');
  return res.status(200).json({ ok: true, source: 'fallback', updatedAt: new Date().toISOString(), rates: DEFAULT_RATES });
}
