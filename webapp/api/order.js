// Buyurtma berilganda — sotilgan mahsulotlarni "sold" deb belgilaydi.
// Ommaviy ro'yxat faqat "approved" ni ko'rsatadi, shuning uchun sotilgani yo'qoladi.
//   POST /api/order  body: { ids: number[] }

import { kvGetJSON, kvSetJSON, kvConfigured } from './_kv.js';

const KEY = 'products:v1';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  // Baza bo'lmasa ham buyurtma jarayoni buzilmasin
  if (!kvConfigured()) {
    return res.status(200).json({ ok: true, note: 'kv off' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const ids = Array.isArray(body?.ids) ? body.ids.map(Number) : [];
  if (!ids.length) {
    return res.status(400).json({ ok: false, error: "ids yo'q" });
  }

  try {
    let all = await kvGetJSON(KEY, []);
    all = all.map((p) =>
      ids.includes(p.id) ? { ...p, status: 'sold', soldAt: new Date().toISOString() } : p
    );
    await kvSetJSON(KEY, all);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
