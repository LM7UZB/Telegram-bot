// Mahsulotlar API:
//   GET  /api/products            -> faqat tasdiqlangan (hammaga ko'rinadigan)
//   GET  /api/products?scope=all  -> barchasi (faqat admin, initData bilan)
//   GET  /api/products?scope=mine&store=X -> shu do'kon mahsulotlari
//   POST /api/products            -> yangi mahsulot yuborish (status: pending)

import { kvGetJSON, kvSetJSON, kvConfigured } from './_kv.js';
import { validateInitData, isAdminUser } from './_auth.js';

const KEY = 'products:v1';

export default async function handler(req, res) {
  if (!kvConfigured()) {
    return res.status(500).json({ ok: false, error: "Baza ulanmagan (KV kalitlari yo'q)" });
  }

  try {
    if (req.method === 'GET') {
      const all = await kvGetJSON(KEY, []);
      const initData = req.headers['x-telegram-init-data'];
      const user = validateInitData(initData, process.env.BOT_TOKEN);
      const scope = req.query?.scope;

      if (scope === 'all' && isAdminUser(user)) {
        return res.status(200).json({ ok: true, products: all });
      }
      if (scope === 'mine' && req.query?.store) {
        return res.status(200).json({
          ok: true,
          products: all.filter((p) => p.store === req.query.store),
        });
      }
      // Ommaviy: faqat tasdiqlangan
      return res.status(200).json({
        ok: true,
        products: all.filter((p) => p.status === 'approved'),
      });
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      const p = body?.product;
      if (!p || !p.title || !p.price || !p.img) {
        return res.status(400).json({ ok: false, error: "Mahsulot ma'lumoti to'liq emas (nom, narx, rasm)" });
      }

      const all = await kvGetJSON(KEY, []);
      const product = {
        id: Date.now(),
        cat: p.cat === 'silver' ? 'silver' : 'gold',
        type: p.type || '',
        title: { uz: String(p.title), ru: String(p.title), en: String(p.title) },
        price: Number(p.price) || 0,
        gram: p.gram ? `${p.gram}g` : '',
        gramValue: parseFloat(p.gram) || 0,
        proba: String(p.proba || ''),
        karat: p.karat || '',
        desc: { uz: p.desc || '', ru: p.desc || '', en: p.desc || '' },
        store: p.store || "Do'kon",
        location: p.location || '',
        logo: '',
        img: p.img || (Array.isArray(p.images) ? p.images[0] : '') || '',
        images: Array.isArray(p.images) && p.images.length ? p.images : (p.img ? [p.img] : []),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      all.unshift(product);
      await kvSetJSON(KEY, all);

      // Adminni xabardor qilamiz (Telegram bot orqali)
      const token = process.env.BOT_TOKEN;
      const admin = process.env.ADMIN_CHAT_ID || '147775103';
      if (token) {
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: admin,
            text:
              `🟡 Tasdiqlash kutilmoqda — yangi mahsulot:\n` +
              `🏢 Do'kon: ${product.store}\n` +
              `🏷 ${p.title}\n💵 ${product.price}$\n⚖️ ${product.gram} (${product.proba})\n📍 ${product.location}\n\n` +
              `Ilovadagi Admin panel orqali tasdiqlang/rad eting.`,
          }),
        }).catch(() => {});
      }

      return res.status(200).json({ ok: true, product });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
