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
  if (!id || !['approve', 'reject', 'delete'].includes(action)) {
    return res.status(400).json({ ok: false, error: "Noto'g'ri so'rov" });
  }

  try {
    let all = await kvGetJSON(KEY, []);
    if (action === 'delete') {
      all = all.filter((p) => p.id !== id);
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
