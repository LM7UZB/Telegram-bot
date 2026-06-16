// Tilla va kumush narxlari ($/gramm). Ustuvorlik:
//   1) Admin qo'lda kiritgan narxlar (KV) — doim tahrirlanadi, hammaga ko'rinadi.
//   2) GoldExpert.uz dan avtomatik (best-effort, so'm->$ konvertatsiya, tilla tishsiz).
//   3) Zaxira (DEFAULT_RATES).
//
// "arzon narx = sotib olish (buy), qimmat narx = sotish (sell)".
//
// Admin:
//   POST {action:'save', rates:[{id,metal,proba,sellPrice,buyPrice}]}
//   POST {action:'clear'}   -> qo'lda narxlarni o'chiradi (yana avtomatik/zaxira)
//
// Tekshirish: /api/metal-rates?debug=1

import { kvGetJSON, kvSetJSON, kvConfigured } from './_kv.js';
import { validateInitData, isAdminUser } from './_auth.js';

const OVERRIDE_KEY = 'metalrates:override:v1';

const DEFAULT_RATES = [
  { id: 'g585', metal: 'gold', proba: '583 / 585', sellPrice: 55, buyPrice: 48 },
  { id: 'g750', metal: 'gold', proba: '750 (18K)', sellPrice: 72, buyPrice: 63 },
  { id: 'g916', metal: 'gold', proba: '916 (22K)', sellPrice: 88, buyPrice: 78 },
  { id: 'g999', metal: 'gold', proba: "999 (Bug'doy)", sellPrice: 96, buyPrice: 87 },
  { id: 's925', metal: 'silver', proba: '925 (Kumush)', sellPrice: 1.3, buyPrice: 0.9 },
  { id: 's999', metal: 'silver', proba: '999 (Chorva)', sellPrice: 1.8, buyPrice: 1.3 },
];

// GoldExpert.uz da qidiriladigan probalar (tilla tish QO'SHILMAYDI)
const GOLD_PROBAS = ['585', '750', '916', '999'];
const SILVER_PROBAS = ['925', '999'];

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'uz,en;q=0.9,ru;q=0.8',
  Referer: 'https://goldexpert.uz/',
};

const PROXIES = [
  (u) => u,
  (u) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
];

const TARGET = process.env.GOLDEXPERT_URL || 'https://goldexpert.uz/';

function toNum(s) {
  if (s == null) return NaN;
  const cleaned = String(s).replace(/\u00a0/g, '').replace(/[^\d.,]/g, '').replace(/\s/g, '');
  if (!cleaned) return NaN;
  // so'm formati odatda "850 000" yoki "850000"; nuqta/vergulni tozalaymiz
  const n = parseFloat(cleaned.replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

// CBU dan USD kursi (so'm -> $ konvertatsiya uchun)
async function getUsdRate() {
  try {
    const r = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/', { headers: { Accept: 'application/json' } });
    const data = await r.json();
    const rate = parseFloat(Array.isArray(data) ? data[0]?.Rate : null);
    return Number.isFinite(rate) && rate > 1000 ? rate : null;
  } catch {
    return null;
  }
}

function cleanText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

// Narxni $/g ga keltiradi: katta son (so'm) bo'lsa CBU bo'yicha bo'ladi
function normalizeToUsd(value, usdRate) {
  if (!Number.isFinite(value)) return NaN;
  if (value > 5000) return usdRate ? value / usdRate : NaN; // so'm
  return value; // allaqachon $
}

function plausibleUsd(metal, v) {
  if (!Number.isFinite(v)) return false;
  return metal === 'gold' ? v >= 20 && v <= 250 : v >= 0.3 && v <= 8;
}

// GoldExpert HTML/matnidan har proba uchun narx(lar)ni ajratadi
function parseGoldExpert(text, usdRate) {
  const flat = cleanText(text);
  const result = {};
  const findFor = (metal, proba) => {
    // proba atrofidagi 0..80 belgidan keyingi 1-2 sonni olamiz
    const re = new RegExp(`${proba}[^\\d]{0,80}?([\\d .,]{3,})(?:[^\\d]{0,20}?([\\d .,]{3,}))?`, 'i');
    const m = flat.match(re);
    if (!m) return null;
    // "tish"/"зуб" yaqinida bo'lsa o'tkazib yuboramiz
    const ctx = flat.slice(Math.max(0, m.index - 25), m.index + 25).toLowerCase();
    if (/tish|зуб|tooth/.test(ctx)) return null;
    const nums = [normalizeToUsd(toNum(m[1]), usdRate), normalizeToUsd(toNum(m[2]), usdRate)]
      .filter((n) => plausibleUsd(metal, n));
    if (nums.length === 0) return null;
    const buy = Math.min(...nums);
    const sell = nums.length > 1 ? Math.max(...nums) : Math.round(buy * 1.12 * 100) / 100;
    return { buy: Math.round(buy * 100) / 100, sell: Math.round(sell * 100) / 100 };
  };
  for (const p of GOLD_PROBAS) { const r = findFor('gold', p); if (r) result[`g${p}`] = r; }
  for (const p of SILVER_PROBAS) { const r = findFor('silver', p); if (r) result[`s${p}`] = r; }
  return result;
}

async function fetchGoldExpert() {
  for (const wrap of PROXIES) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(wrap(TARGET), { headers: BROWSER_HEADERS, redirect: 'follow', signal: ctrl.signal });
      clearTimeout(timer);
      if (!r.ok) continue;
      const text = await r.text();
      if (text && text.length > 200) return text;
    } catch { /* keyingi proksi */ }
  }
  return null;
}

// Avtomatik narxlarni DEFAULT ustiga qo'yadi (topilgan probalar yangilanadi)
function mergeAuto(base, auto) {
  return base.map((row) => {
    const a = auto[row.id];
    return a ? { ...row, buyPrice: a.buy, sellPrice: a.sell } : row;
  });
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
      if (rates.length === 0) return res.status(400).json({ ok: false, error: 'Narxlar bo\'sh' });
      const payload = { rates, updatedAt: new Date().toISOString() };
      await kvSetJSON(OVERRIDE_KEY, payload);
      return res.status(200).json({ ok: true, source: 'admin', ...payload });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  }

  const debug = req.query?.debug === '1' || req.query?.debug === 'true';

  // 1) Admin override
  if (!debug && kvConfigured()) {
    try {
      const ov = await kvGetJSON(OVERRIDE_KEY, null);
      if (ov && Array.isArray(ov.rates) && ov.rates.length) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ ok: true, source: 'admin', updatedAt: ov.updatedAt, rates: ov.rates });
      }
    } catch { /* davom */ }
  }

  // 2) GoldExpert.uz (best-effort)
  try {
    const [html, usdRate] = await Promise.all([fetchGoldExpert(), getUsdRate()]);
    if (html) {
      const auto = parseGoldExpert(html, usdRate);
      if (debug) {
        return res.status(200).json({ ok: true, debug: true, usdRate, parsed: auto, snippet: cleanText(html).slice(0, 1500) });
      }
      if (Object.keys(auto).length > 0) {
        res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=86400'); // 12 soat
        return res.status(200).json({ ok: true, source: 'goldexpert', updatedAt: new Date().toISOString(), rates: mergeAuto(DEFAULT_RATES, auto) });
      }
    }
    if (debug) return res.status(200).json({ ok: false, debug: true, note: 'GoldExpert ochilmadi yoki parse bo\'sh', usdRate });
  } catch (e) {
    if (debug) return res.status(200).json({ ok: false, debug: true, error: String(e) });
  }

  // 3) Zaxira
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
  return res.status(200).json({ ok: true, source: 'fallback', updatedAt: new Date().toISOString(), rates: DEFAULT_RATES });
}
