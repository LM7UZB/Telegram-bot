// Bir marta ochiladigan SOZLASH endpointi.
// Brauzerda oching: https://<sizning-sayt>.vercel.app/api/setup
// Bu:
//   1) Webhookni o'rnatadi (/api/bot) -> /start ishlay boshlaydi
//   2) Menyu tugmasini ("Do'kon") web ilovaga bog'laydi
//   3) Buyruqlar ro'yxatini (/start, /help) o'rnatadi

export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    return res.status(500).json({ ok: false, error: "BOT_TOKEN yo'q (Vercel Environment Variables ga qo'shing)" });
  }

  const base = `https://${req.headers.host}`;

  const api = (method, body) =>
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json());

  try {
    const webhook = await api('setWebhook', {
      url: `${base}/api/bot`,
      allowed_updates: ['message'],
      drop_pending_updates: true,
    });

    const menu = await api('setChatMenuButton', {
      menu_button: { type: 'web_app', text: "Do'kon", web_app: { url: `${base}/?v=${Date.now()}` } },
    });

    const commands = await api('setMyCommands', {
      commands: [
        { command: 'start', description: "Botni ishga tushirish / Do'konni ochish" },
        { command: 'help', description: 'Yordam' },
      ],
    });

    return res.status(200).json({
      ok: true,
      message: "✅ Bot to'liq sozlandi! Endi botga /start yuboring yoki 'Do'kon' tugmasini bosing.",
      base,
      webhook,
      menu,
      commands,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
