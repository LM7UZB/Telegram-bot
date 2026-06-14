// Admin tomonidan mahsulotni tasdiqlash / rad etish / o'chirish.
// Faqat admin (Telegram initData bilan tekshiriladi).
//   POST /api/review  body: { id, action: 'approve'|'reject'|'delete' }

import { kvGetJSON, kvSetJSON, kvConfigured } from './_kv.js';
import { validateInitData, isAdminUser } from './_auth.js';

const KEY = 'products:v1';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!kvConfigured()) {
    return res.status(500).json({ ok: false, error: 'Baza ulanmagan' });
  }

  const initData = req.headers['x-telegram-init-data'];
  const user = validateInitData(initData, process.env.BOT_TOKEN);
  if (!isAdminUser(user)) {
    return res.status(403).json({ ok: false, error: 'Faqat admin bajara oladi' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const id = Number(body?.id);
  const action = body?.action;
  if (!id || !['approve', 'reject', 'delete', 'update'].includes(action)) {
    return res.status(400).json({ ok: false, error: "Noto'g'ri so'rov" });
  }

  try {
    let all = await kvGetJSON(KEY, []);
    if (action === 'delete') {
      all = all.filter((p) => p.id !== id);
    } else if (action === 'update') {
      const u = body.product || {};
      all = all.map((p) => {
        if (p.id !== id) return p;
        const m = { ...p };
        if (u.title != null) m.title = { uz: String(u.title), ru: String(u.title), en: String(u.title) };
        if (u.desc != null) m.desc = { uz: String(u.desc), ru: String(u.desc), en: String(u.desc) };
        if (u.price != null) m.price = Number(u.price) || 0;
        if (u.gram != null) { m.gram = u.gram ? `${u.gram}`.replace(/g$/i, '') + 'g' : ''; m.gramValue = parseFloat(u.gram) || 0; }
        if (u.proba != null) m.proba = String(u.proba);
        if (u.karat != null) m.karat = String(u.karat);
        if (u.location != null) m.location = String(u.location);
        if (u.store != null) m.store = String(u.store);
        if (u.type != null) m.type = String(u.type);
        if (u.cat != null) m.cat = u.cat === 'silver' ? 'silver' : 'gold';
        if (Array.isArray(u.images) && u.images.length) { m.images = u.images; m.img = u.images[0]; }
        return m;
      });
    } else {
      all = all.map((p) =>
        p.id === id ? { ...p, status: action === 'approve' ? 'approved' : 'rejected' } : p
      );
    }
    await kvSetJSON(KEY, all);
    return res.status(200).json({ ok: true, products: all });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
