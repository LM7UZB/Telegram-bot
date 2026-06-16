// bank.uz dan O'zbekiston banklari bo'yicha USD (dollar) kurslarini olib beradi.
//
// Qaytaradi:
//   bestBuy  — eng YUQORI "sotib olish" narxli 3 ta bank
//              (bank sizdan dollarni qimmatroq oladi => dollaringizni SOTISH uchun eng yaxshi)
//   bestSell — eng PAST "sotish" narxli 3 ta bank
//              (bank sizga dollarni arzonroq sotadi => dollar SOTIB OLISH uchun eng yaxshi)
//
// Manba: https://bank.uz/uz/currency  (BANK_UZ_URL bilan o'zgartirsa bo'ladi).
// Eslatma: bank.uz Cloudflare bilan himoyalangan — brauzerga o'xshash header'lar yuboramiz.
//
// Tekshirish: /api/bank-rates?debug=1  -> olingan xom javobning bir qismini qaytaradi,
//             shunda real format ko'rinadi va parser aniq sozlanadi.
//
// Node 18+ da global fetch mavjud — qo'shimcha npm paket kerak emas.

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/html, application/xhtml+xml, */*;q=0.9',
  'Accept-Language': 'uz-UZ,uz;q=0.9,ru;q=0.8,en;q=0.7',
  Referer: 'https://bank.uz/uz/currency',
};

// Sinab ko'riladigan manbalar (birinchi muvaffaqiyatlisi ishlatiladi).
function candidateSources() {
  const custom = process.env.BANK_UZ_URL;
  const list = [
    'https://bank.uz/uz/currency',
    'https://bank.uz/api/v1/best_currency_rate',
    'https://bank.uz/ru/currency',
  ];
  if (custom) list.unshift(custom);
  return list;
}

// "12 690", "12,690.00", "12690,5" kabi matnlarni songa aylantiradi.
function toNumber(v) {
  if (v == null) return NaN;
  if (typeof v === 'number') return v;
  let s = String(v).trim().replace(/\u00a0/g, ' ');
  // bo'sh joy va valyuta belgilarini olib tashlash
  s = s.replace(/[^\d.,]/g, '');
  if (!s) return NaN;
  // o'nlik ajratgichni normalizatsiya qilish
  if (s.includes('.') && s.includes(',')) {
    // oxirgisi o'nlik ajratgich deb hisoblaymiz
    s = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '');
  } else if (s.includes(',')) {
    // vergul mingliklar yoki o'nlik bo'lishi mumkin
    const parts = s.split(',');
    s = parts[parts.length - 1].length === 3 ? s.replace(/,/g, '') : s.replace(',', '.');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}

// Faqat real bank kurslarini qoldiramiz (UZSdagi mantiqiy oraliq).
function isPlausibleRate(n) {
  return Number.isFinite(n) && n > 1000 && n < 100000;
}

// JSON javobdan bank ro'yxatini ajratib oladi (turli mumkin bo'lgan formatlarni qo'llab-quvvatlaydi).
function parseJson(data) {
  const rows = [];
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visit); return; }

    const name =
      node.bank_name || node.bankName || node.name ||
      node.title || node.bank || (node.bank && node.bank.name);
    const buy = toNumber(
      node.buy ?? node.buy_price ?? node.buyPrice ?? node.purchase ?? node.in ?? node.cb_buy
    );
    const sell = toNumber(
      node.sell ?? node.sell_price ?? node.sellPrice ?? node.sale ?? node.out ?? node.cb_sell
    );
    const ccy = String(node.currency || node.ccy || node.code || node.currency_code || 'USD').toUpperCase();

    if (name && ccy.includes('USD') && (isPlausibleRate(buy) || isPlausibleRate(sell))) {
      rows.push({ bank: String(name).trim(), buy, sell });
    }
    Object.values(node).forEach(visit);
  };
  visit(data);
  return rows;
}

// HTML javobdan USD qatorlarini ajratib oladi (heuristik, bank nomi + 2 ta son).
function parseHtml(html) {
  const rows = [];
  // <tr> ... </tr> bloklarini ajratib, ichidan matn va sonlarni olamiz
  const trBlocks = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  for (const tr of trBlocks) {
    const cells = (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map((c) =>
      c.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    );
    if (cells.length < 3) continue;
    // bank nomi: birinchi harfli katak; sonlar: mantiqiy oraliqdagi raqamlar
    const name = cells.find((c) => /[a-zA-Zа-яА-ЯёЁ]{3,}/.test(c) && !/USD|сум|so'm|сом/i.test(c));
    const nums = cells.map(toNumber).filter(isPlausibleRate);
    if (name && nums.length >= 2) {
      rows.push({ bank: name, buy: nums[0], sell: nums[1] });
    }
  }
  return rows;
}

async function fetchSource(url) {
  const r = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow' });
  const ctype = (r.headers.get('content-type') || '').toLowerCase();
  const text = await r.text();
  return { ok: r.ok, status: r.status, ctype, text };
}

// bank.uz ochilmasa ko'rsatiladigan zaxira ma'lumot (real bank nomlari, taxminiy kurs).
// Vercel'da bank.uz ishlasa, bu avtomatik jonli kurs bilan almashtiriladi.
// Raqamlarni xohlagancha aniq qiymatga o'zgartirsangiz bo'ladi.
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
  const errors = [];

  for (const url of candidateSources()) {
    try {
      const { ok, status, ctype, text } = await fetchSource(url);
      if (!ok) { errors.push({ url, status }); continue; }

      let rows = [];
      const looksJson = ctype.includes('json') || /^\s*[[{]/.test(text);
      if (looksJson) {
        try { rows = parseJson(JSON.parse(text)); } catch { /* JSON emas ekan */ }
      }
      if (rows.length === 0) rows = parseHtml(text);

      if (debug) {
        return res.status(200).json({
          ok: true,
          debug: true,
          source: url,
          status,
          contentType: ctype,
          parsedCount: rows.length,
          sampleParsed: rows.slice(0, 5),
          rawSnippet: text.slice(0, 1500),
        });
      }

      if (rows.length === 0) { errors.push({ url, reason: 'parse bo\'sh' }); continue; }

      // Dublikatlarni olib tashlash (bank nomi bo'yicha)
      const seen = new Map();
      for (const row of rows) {
        const key = row.bank.toLowerCase();
        if (!seen.has(key)) seen.set(key, row);
      }
      const unique = [...seen.values()];

      const bestBuy = unique
        .filter((r) => isPlausibleRate(r.buy))
        .sort((a, b) => b.buy - a.buy)
        .slice(0, 3)
        .map((r) => ({ bank: r.bank, rate: r.buy }));

      const bestSell = unique
        .filter((r) => isPlausibleRate(r.sell))
        .sort((a, b) => a.sell - b.sell)
        .slice(0, 3)
        .map((r) => ({ bank: r.bank, rate: r.sell }));

      if (bestBuy.length === 0 && bestSell.length === 0) {
        errors.push({ url, reason: 'kurslar topilmadi' });
        continue;
      }

      // 30 daqiqa keshlash (Vercel CDN)
      res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
      return res.status(200).json({
        ok: true,
        ccy: 'USD',
        source: 'bank.uz',
        updatedAt: new Date().toISOString(),
        bestBuy, // eng yuqori sotib olish — dollarni SOTISH uchun
        bestSell, // eng past sotish — dollar SOTIB OLISH uchun
      });
    } catch (e) {
      errors.push({ url, error: String(e) });
    }
  }

  // bank.uz ochilmadi — zaxira ma'lumotni qaytaramiz (widget bo'sh qolmasligi uchun).
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
  return res.status(200).json({
    ok: true,
    ccy: 'USD',
    source: 'fallback',
    updatedAt: new Date().toISOString(),
    bestBuy: STATIC_FALLBACK.bestBuy,
    bestSell: STATIC_FALLBACK.bestSell,
    note: 'bank.uz dan jonli ma\'lumot olinmadi; taxminiy kurslar ko\'rsatilmoqda',
    tried: errors,
  });
}