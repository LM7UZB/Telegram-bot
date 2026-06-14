// Buyurtmalar:
//   POST /api/order  body: { ids: number[], order?: {total, items, payment, buyer} }
//        -> sotilgan mahsulotlarni "sold" qiladi va buyurtmani statistikaga yozadi
//   GET  /api/order  (admin, initData)  -> barcha buyurtmalar (statistika uchun)

import { kvGetJSON, kvSetJSON, kvConfigured } from './_kv.js';
import { validateInitData, isAdminUser } from './_auth.js';

const KEY = 'products:v1';
const ORDERS = 'orders:v1';

export default async function handler(req, res) {
  if (!kvConfigured()) {
    return res.status(200).json({ ok: true, orders: [], note: 'kv off' });
  }

  // GET — admin uchun buyurtmalar ro'yxati
  if (req.method === 'GET') {
    const user = validateInitData(req.headers['x-telegram-init-data'], process.env.BOT_TOKEN);
    if (!isAdminUser(user)) return res.status(403).json({ ok: false, error: 'Faqat admin' });
    const orders = await kvGetJSON(ORDERS, []);
    return res.status(200).json({ ok: true, orders });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const ids = Array.isArray(body?.ids) ? body.ids.map(Number) : [];

  try {
    // 1) Mahsulotlarni sotilgan deb belgilaymiz (ro'yxatdan yo'qoladi)
    if (ids.length) {
      let all = await kvGetJSON(KEY, []);
      all = all.map((p) =>
        ids.includes(p.id) ? { ...p, status: 'sold', soldAt: new Date().toISOString() } : p
      );
      await kvSetJSON(KEY, all);
    }

    // 2) Buyurtmani statistikaga yozamiz
    if (body?.order) {
      const orders = await kvGetJSON(ORDERS, []);
      orders.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        total: Number(body.order.total) || 0,
        items: Array.isArray(body.order.items) ? body.order.items : [],
        payment: body.order.payment || '',
        buyer: body.order.buyer || '',
      });
      await kvSetJSON(ORDERS, orders.slice(0, 1000));
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
