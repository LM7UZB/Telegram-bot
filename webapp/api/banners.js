// Reklama bannerlari:
//   GET  /api/banners              -> hammaga (bosh sahifa reklamalari)
//   POST /api/banners {action:'add', img, target}   -> admin: yangi banner
//   POST /api/banners {action:'delete', id}          -> admin: bannerni o'chirish

import { kvGetJSON, kvSetJSON, kvConfigured } from './_kv.js';
import { validateInitData, isAdminUser } from './_auth.js';

const KEY = 'banners:v1';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (!kvConfigured()) return res.status(200).json({ ok: true, banners: [] });
    const banners = await kvGetJSON(KEY, []);
    return res.status(200).json({ ok: true, banners });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!kvConfigured()) {
    return res.status(500).json({ ok: false, error: 'Baza ulanmagan' });
  }

  const user = validateInitData(req.headers['x-telegram-init-data'], process.env.BOT_TOKEN);
  if (!isAdminUser(user)) {
    return res.status(403).json({ ok: false, error: 'Faqat admin bajara oladi' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const action = body?.action;

  try {
    let banners = await kvGetJSON(KEY, []);
    if (action === 'add') {
      if (!body.img) return res.status(400).json({ ok: false, error: "Rasm yo'q" });
      banners.unshift({
        id: Date.now(),
        img: body.img,
        media: body.media === 'video' ? 'video' : 'image',
        target: body.target || { type: 'category', value: 'gold' },
      });
    } else if (action === 'delete') {
      banners = banners.filter((b) => b.id !== Number(body.id));
    } else {
      return res.status(400).json({ ok: false, error: "Noto'g'ri amal" });
    }
    await kvSetJSON(KEY, banners);
    return res.status(200).json({ ok: true, banners });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
