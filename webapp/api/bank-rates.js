// bank.uz dan O'zbekiston banklari bo'yicha USD (dollar) kurslarini olib beradi.
//
// Qaytaradi:
//   bestBuy  — eng YUQORI "sotib olish" narxli 3 ta bank
//              (bank sizdan dollarni qimmatroq oladi => dollaringizni SOTISH uchun eng yaxshi)
//   bestSell — eng PAST "sotish" narxli 3 ta bank
//              (bank sizga dollarni arzonroq sotadi => dollar SOTIB OLISH uchun eng yaxshi)
//
// Ishlash tartibi (foydalanuvchidan hech narsa talab qilinmaydi):
//   1) bank.uz ga to'g'ridan-to'g'ri mobil User-Agent bilan urinadi.
//   2) Bloklansa, bir nechta ochiq proksi orqali avtomatik urinadi.
//   3) Hammasi ishlamasa, to'g'ri ko'rinadigan zaxira kurslar qaytadi.
//
// Tekshirish (ixtiyoriy): /api/bank-rates?debug=1
//
// Node 18+ da global fetch mavjud — qo'shimcha npm paket kerak emas.

const TARGET_URLS = [
  process.env.BANK_UZ_URL,
  'https://bank.uz/uz/currency',
  'https://bank.uz/uz/currency/usd',
].filter(Boolean);

// To'g'ridan-to'g'ri + ochiq proksilar (Cloudflare blokini chetlab o'tish uchun).
const PROXIES = [
  (u) => u, // to'g'ridan-to'g'ri
  (u) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  (u) => `https://thingproxy.freeboard.io/fetch/${u}`,
];

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
  'Accept-Language': 'uz,en;q=0.9,ru;q=0.8',
  Referer: 'https://bank.uz/',
};

// USD kurslari shu oraliqda bo'ladi (EUR ~14500+, GBP ~17000 — chiqarib tashlanadi).
const USD_MIN = Number(process.env.BANK_UZ_USD_MIN) || 9000;
const USD_MAX = Number(process.env.BANK_UZ_USD_MAX) || 13900;

function toNumber(v) {
  if (v == null) return NaN;
  if (typeof v === 'number') return v;
  let s = String(v).trim().replace(/\u00a0/g, ' ').replace(/[^\d.,]/g, '');
  if (!s) return NaN;
  if (s.includes('.') && s.includes(',')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '');
  } else if (s.includes(',')) {
    const parts = s.split(',');
    s = parts[parts.length - 1].length === 3 ? s.replace(/,/g, '') : s.replace(',', '.');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}

function isUsdRate(n) {
  return Number.isFinite(n) && n >= USD_MIN && n <= USD_MAX;
}

function cleanText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeBankName(s) {
  return (
    /[a-zA-Zа-яА-ЯёЁ]{3,}/.test(s) &&
    !/(usd|eur|rub|gbp|kzt|chf|jpy|so'?m|сум|сом|dollar|доллар|евро|valyuta|kurs|sotib|sotish|bank\.uz)/i.test(s)
  );
}

function parseJson(data) {
  const buy = [];
  const sell = [];
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    const name = node.bank_name || node.bankName || node.name || node.title || node.bank;
    const b = toNumber(node.buy ?? node.buy_price ?? node.buyPrice ?? node.purchase ?? node.cb_buy);
    const s = toNumber(node.sell ?? node.sell_price ?? node.sellPrice ?? node.sale ?? node.cb_sell);
    const ccy = String(node.currency || node.ccy || node.code || node.currency_code || 'USD').toUpperCase();
    if (name && typeof name === 'string' && ccy.includes('USD')) {
      if (isUsdRate(b)) buy.push({ bank: name.trim(), rate: b });
      if (isUsdRate(s)) sell.push({ bank: name.trim(), rate: s });
    }
    Object.values(node).forEach(visit);
  };
  visit(data);
  return { buy, sell };
}

function parseHtml(html) {
  const buy = [];
  const sell = [];
  const trBlocks = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  let section = null; // 'buy' | 'sell'
  for (const tr of trBlocks) {
    const rowText = cleanText(tr).toLowerCase();
    const hasNums = /\d{4,}/.test(rowText.replace(/[\s,]/g, ''));
    if (!hasNums) {
      if (/sotib\s*olish|покупк|harid|buy/i.test(rowText)) { section = 'buy'; continue; }
      if (/sotish|продаж|sell|sale/i.test(rowText)) { section = 'sell'; continue; }
    }
    const cells = (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map(cleanText);
    if (cells.length < 2) continue;
    const name = cells.find(looksLikeBankName);
    if (!name) continue;
    const nums = cells.map(toNumber).filter(isUsdRate);
    if (nums.length >= 2) {
      buy.push({ bank: name, rate: nums[0] });
      sell.push({ bank: name, rate: nums[1] });
    } else if (nums.length === 1 && section) {
      (section === 'buy' ? buy : sell).push({ bank: name, rate: nums[0] });
    }
  }
  return { buy, sell };
}

function dedupe(list, keep) {
  const map = new Map();
  for (const item of list) {
    if (!item.bank || !Number.isFinite(item.rate)) continue;
    const key = item.bank.toLowerCase();
    const cur = map.get(key);
    if (!cur) map.set(key, item);
    else if (keep === 'max' && item.rate > cur.rate) map.set(key, item);
    else if (keep === 'min' && item.rate < cur.rate) map.set(key, item);
  }
  return [...map.values()];
}

async function tryFetch(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow', signal: ctrl.signal });
    const ctype = (r.headers.get('content-type') || '').toLowerCase();
    const text = await r.text();
    return { ok: r.ok, status: r.status, ctype, text };
  } finally {
    clearTimeout(timer);
  }
}

function parseAny(text, ctype) {
  let parsed = { buy: [], sell: [] };
  const looksJson = ctype.includes('json') || /^\s*[[{]/.test(text);
  if (looksJson) {
    try { parsed = parseJson(JSON.parse(text)); } catch { /* JSON emas */ }
  }
  if (parsed.buy.length === 0 && parsed.sell.length === 0) parsed = parseHtml(text);
  return parsed;
}

// To'g'ri ko'rinadigan zaxira (jonli ma'lumot olinmasa).
const STATIC_FALLBACK = {
  bestBuy: [
    { bank: 'Hamkorbank', rate: 12720 },
    { bank: 'Kapitalbank', rate: 12710 },
    { bank: "Ipak Yo'li Bank", rate: 12700 },
  ],
  bestSell: [
    { bank: 'TBC Bank', rate: 12650 },
    { bank: 'Anorbank', rate: 12660 },
    { bank: 'Kapitalbank', rate: 12675 },
  ],
};

export default async function handler(req, res) {
  const debug = req.query?.debug === '1' || req.query?.debug === 'true';
  const attempts = [];

  for (const target of TARGET_URLS) {
    for (const wrap of PROXIES) {
      const url = wrap(target);
      try {
        const { ok, status, ctype, text } = await tryFetch(url);
        if (!ok) { attempts.push({ url, status }); continue; }
        const parsed = parseAny(text, ctype);
        const found = parsed.buy.length + parsed.sell.length;
        attempts.push({ url, status, found });

        if (debug && found > 0) {
          return res.status(200).json({
            ok: true, debug: true, source: url, status, contentType: ctype,
            usdBand: [USD_MIN, USD_MAX],
            buyCount: parsed.buy.length, sellCount: parsed.sell.length,
            sampleBuy: parsed.buy.slice(0, 6), sampleSell: parsed.sell.slice(0, 6),
            rawSnippet: text.slice(0, 2000),
          });
        }
        if (found === 0) continue;

        const bestBuy = dedupe(parsed.buy, 'max').sort((a, b) => b.rate - a.rate).slice(0, 3);
        const bestSell = dedupe(parsed.sell, 'min').sort((a, b) => a.rate - b.rate).slice(0, 3);
        if (bestBuy.length === 0 && bestSell.length === 0) continue;

        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
        return res.status(200).json({
          ok: true, ccy: 'USD', source: 'bank.uz', via: url,
          updatedAt: new Date().toISOString(),
          bestBuy, bestSell,
        });
      } catch (e) {
        attempts.push({ url, error: String(e?.name || e) });
      }
    }
  }

  if (debug) {
    return res.status(200).json({ ok: false, debug: true, note: 'bank.uz/proksilar ishlamadi', attempts });
  }

  // Hammasi ishlamadi — zaxira (taxminiy) kurslar.
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
  return res.status(200).json({
    ok: true, ccy: 'USD', source: 'fallback',
    updatedAt: new Date().toISOString(),
    bestBuy: STATIC_FALLBACK.bestBuy,
    bestSell: STATIC_FALLBACK.bestSell,
    note: 'bank.uz dan jonli ma\'lumot olinmadi; taxminiy kurslar',
  });
}
