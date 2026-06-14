// Telegram webhook bot — serverless (server kerak emas, Vercel boshqaradi).
// Telegram barcha xabarlarni (/start va h.k.) shu endpointga yuboradi.
// Bir marta /api/setup ni ochib, webhookni o'rnatish kerak.

const WELCOME = (name) =>
  `💎 Assalomu alaykum, ${name}!\n\n` +
  `✨ TillaBazarga xush kelibsiz!\n\n` +
  `🥇 O'zbekistonning eng yirik oltin va kumush zargarlik buyumlari bozori.\n\n` +
  `👇 Ilovani ochish uchun tugmani bosing:`;

export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    return res.status(500).json({ ok: false, error: "BOT_TOKEN yo'q (Vercel env)" });
  }

  // Brauzerda ochilsa (GET) — holatni ko'rsatamiz
  if (req.method !== 'POST') {
    return res.status(200).send('TillaBazar bot webhook ishlayapti ✅');
  }

  const WEBAPP_URL = (process.env.WEBAPP_URL || `https://${req.headers.host}`).replace(/\/+$/, '');
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '147775103';

  const api = (method, body) =>
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  try {
    let update = req.body;
    if (typeof update === 'string') {
      try { update = JSON.parse(update); } catch { update = {}; }
    }
    const msg = update?.message;

    if (msg) {
      const chatId = msg.chat?.id;
      const name = msg.from?.first_name || 'mehmon';
      const text = msg.text || '';

      if (msg.web_app_data?.data) {
        // Ilovadan (klaviatura tugmasi orqali) kelgan ma'lumot -> adminga
        const tag = msg.from?.username ? '@' + msg.from.username : `${name} (ID: ${msg.from?.id})`;
        await api('sendMessage', {
          chat_id: ADMIN_CHAT_ID,
          text: `📥 Ilovadan (${tag}):\n\n${msg.web_app_data.data}`,
        });
        await api('sendMessage', { chat_id: chatId, text: '✅ Arizangiz qabul qilindi!' });
      } else if (text.startsWith('/start') || text.startsWith('/help')) {
        await api('sendMessage', {
          chat_id: chatId,
          text: WELCOME(name),
          reply_markup: {
            inline_keyboard: [[{ text: "💍 TillaBazar'ni ochish", web_app: { url: WEBAPP_URL } }]],
          },
        });
      }
    }
  } catch (e) {
    console.error('bot webhook xatosi:', e);
  }

  // Telegramga doim 200 qaytaramiz (aks holda u qayta-qayta yuboraveradi)
  return res.status(200).json({ ok: true });
}
