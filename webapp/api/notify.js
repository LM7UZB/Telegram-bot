// Vercel Serverless Function — server kerak emas.
// Ilovadagi "Sotish" / "Bizga sotish" formalari shu funksiyaga POST qiladi,
// funksiya esa Telegram Bot API orqali ma'lumotni adminga yuboradi.
//
// Vercel'da quyidagi muhit o'zgaruvchilarini belgilang:
//   BOT_TOKEN      — BotFather'dan olingan token
//   ADMIN_CHAT_ID  — arizalar yuboriladigan chat ID (@userinfobot beradi)
//
// Hech qanday npm paket kerak emas: Node 18+ da global fetch bor.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    return res.status(500).json({
      ok: false,
      error: 'Server sozlanmagan: BOT_TOKEN yoki ADMIN_CHAT_ID yo\'q',
    });
  }

  // Vercel JSON body'ni avtomatik parse qiladi; ehtiyot uchun qo'lda ham tekshiramiz
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const text = body?.text;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ ok: false, error: 'text bo\'sh' });
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: text.slice(0, 4000), // Telegram xabar uzunligi cheklovi
        disable_web_page_preview: false,
      }),
    });
    const data = await tgRes.json();
    if (!tgRes.ok || !data.ok) {
      return res.status(502).json({ ok: false, error: data.description || 'Telegram xatosi' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
