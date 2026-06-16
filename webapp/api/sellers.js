// Sotuvchilar (do'kon egalari) reestri:
//   POST /api/sellers  {action:'touch', username, storeName}
//        -> sotuvchi kirganda yozadi (firstSeenAt — qachon qo'shilgani, lastLoginAt)
//   GET  /api/sellers   (faqat admin, initData)
//        -> barcha sotuvchilar ro'yxati

import { kvGetJSON, kvSetJSON, kvConfigured } from './_kv.js';
import { validateInitData, isAdminUser } from './_auth.js';

const KEY = 'sellers:v1';

export default async function handler(req, res) {
  if (!kvConfigured()) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, sellers: [] });
    return res.status(500).json({ ok: false, error: 'Baza ulanmagan' });
  }

  // Admin uchun sotuvchilar ro'yxati
  if (req.method === 'GET') {
    const user = validateInitData(req.headers['x-telegram-init-data'], process.env.BOT_TOKEN);
    if (!isAdminUser(user)) return res.status(403).json({ ok: false, error: 'Faqat admin' });
    const map = await kvGetJSON(KEY, {});
    const sellers = Object.values(map).sort(
      (a, b) => new Date(b.firstSeenAt || 0).getTime() - new Date(a.firstSeenAt || 0).getTime()
    );
    return res.status(200).json({ ok: true, sellers });
  }

  // Sotuvchi kirganda reestrni yangilash
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const storeName = String(body?.storeName || '').trim();
    const username = String(body?.username || '').trim();
    if (!storeName) return res.status(400).json({ ok: false, error: 'storeName kerak' });

    try {
      const map = await kvGetJSON(KEY, {});
      const now = new Date().toISOString();
      const existing = map[storeName] || {};
      map[storeName] = {
        storeName,
        username: username || existing.username || '',
        firstSeenAt: existing.firstSeenAt || now,
        lastLoginAt: now,
        loginCount: (existing.loginCount || 0) + 1,
      };
      await kvSetJSON(KEY, map);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
