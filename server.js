import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Bot, InlineKeyboard, Keyboard, GrammyError, HttpError } from 'grammy';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ----------------------------------------------------------------------------
// Sozlamalar (.env faylidan o'qiladi)
// ----------------------------------------------------------------------------
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = (process.env.WEBAPP_URL || '').trim().replace(/\/+$/, '');
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID; // adminga arizalar yuboriladi
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN topilmadi! .env faylida BOT_TOKEN ni belgilang.');
  process.exit(1);
}

const isHttps = WEBAPP_URL.startsWith('https://');
if (!WEBAPP_URL) {
  console.warn('⚠️  WEBAPP_URL belgilanmagan. Telegram tugmalari ishlamaydi. .env ga WEBAPP_URL ni qo\'shing.');
} else if (!isHttps) {
  console.warn(`⚠️  WEBAPP_URL HTTPS bo'lishi shart (hozir: ${WEBAPP_URL}). Telegram faqat HTTPS manzilni ochadi.`);
}

// ----------------------------------------------------------------------------
// 1-qism: Express server — tayyor frontend'ni (webapp/dist) serve qiladi
// ----------------------------------------------------------------------------
const app = express();
const distDir = path.join(__dirname, 'webapp', 'dist');

app.get('/health', (_req, res) => res.json({ ok: true, status: 'running' }));

app.use(express.static(distDir));

// SPA fallback — barcha yo'llar uchun index.html (HECH QACHON keshlanmaydi — yangi deploy darrov ko'rinadi)
app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) {
      res
        .status(500)
        .send('Frontend hali build qilinmagan. "npm run build" buyrug\'ini ishga tushiring.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Web ilova ishga tushdi: http://localhost:${PORT}`);
});

// ----------------------------------------------------------------------------
// 2-qism: Telegram bot (grammY, long polling)
// ----------------------------------------------------------------------------
const bot = new Bot(BOT_TOKEN);

const T = {
  welcome: (name) =>
    `Assalomu alaykum, ${name}! 👋\n\n` +
    `💎 *TillaBazar* — tilla va kumush buyumlar onlayn bozoriga xush kelibsiz!\n\n` +
    `Quyidagi "🛒 Do'konni ochish" tugmasini bosing va xaridni boshlang.\n\n` +
    `_Eslatma:_ sotish/sotib olish arizalarini yuborish uchun ilovani pastdagi *klaviatura tugmasi* orqali oching.`,
  noUrl:
    "⚠️ Do'kon manzili (WEBAPP_URL) hali sozlanmagan. Iltimos, administrator bilan bog'laning.",
  openShop: "🛒 Do'konni ochish",
  help:
    "ℹ️ *Yordam*\n\n" +
    "• /start — botni qayta ishga tushirish\n" +
    "• 🛒 *Do'konni ochish* — TillaBazar ilovasini ochish\n" +
    "• Ilovadagi *Sotish* va *Bizga sotish* formalari to'g'ridan-to'g'ri adminga yuboriladi.",
  received:
    "✅ Arizangiz qabul qilindi! Operatorlarimiz tez orada siz bilan bog'lanishadi.",
  adminMissing:
    "✅ Ma'lumotlaringiz qabul qilindi! (Eslatma: admin kanali hali ulanmagan)",
};

function buildInlineKeyboard() {
  if (isHttps) {
    return new InlineKeyboard().webApp(T.openShop, WEBAPP_URL);
  }
  return undefined;
}

function buildReplyKeyboard() {
  // Reply (klaviatura) tugmasidagi web_app — bu yerda sendData() ishlaydi,
  // ya'ni ilovadan adminga ma'lumot yuborish shu tugma orqali ochilganda ishlaydi.
  if (isHttps) {
    return new Keyboard()
      .webApp(T.openShop, WEBAPP_URL)
      .resized()
      .persistent();
  }
  return undefined;
}

bot.command('start', async (ctx) => {
  const name = ctx.from?.first_name || 'mehmon';
  const inline = buildInlineKeyboard();
  const reply = buildReplyKeyboard();

  if (!inline && !reply) {
    await ctx.reply(T.noUrl);
    return;
  }

  // Avval doimiy klaviatura tugmasini o'rnatamiz (sendData shu orqali ishlaydi)
  await ctx.reply(T.welcome(name), {
    parse_mode: 'Markdown',
    reply_markup: reply,
  });

  // Qulay bo'lishi uchun inline tugma ham yuboramiz
  if (inline) {
    await ctx.reply("👇 Tezkor ochish:", { reply_markup: inline });
  }
});

bot.command('help', async (ctx) => {
  await ctx.reply(T.help, { parse_mode: 'Markdown' });
});

// Ilovadan (Telegram.WebApp.sendData) kelgan ma'lumotlarni qabul qilish
bot.on('message:web_app_data', async (ctx) => {
  const data = ctx.message.web_app_data?.data || '';
  const u = ctx.from;
  const userTag = u?.username ? `@${u.username}` : `${u?.first_name || ''} (ID: ${u?.id})`;

  const adminMessage =
    `📥 *Yangi ariza* (ilovadan)\n` +
    `👤 Foydalanuvchi: ${userTag}\n` +
    `🆔 Chat ID: \`${ctx.chat.id}\`\n` +
    `————————————\n` +
    `${data}`;

  if (ADMIN_CHAT_ID) {
    try {
      await ctx.api.sendMessage(ADMIN_CHAT_ID, adminMessage, { parse_mode: 'Markdown' });
      await ctx.reply(T.received);
    } catch (err) {
      console.error('Adminga yuborishda xatolik:', err);
      await ctx.reply(T.received);
    }
  } else {
    console.warn('ADMIN_CHAT_ID belgilanmagan — ariza adminga yuborilmadi.');
    console.log('Kelgan ariza:\n', data);
    await ctx.reply(T.adminMissing);
  }
});

// Boshqa xabarlarga oddiy javob
bot.on('message:text', async (ctx) => {
  if (ctx.message.text?.startsWith('/')) return; // noma'lum buyruqlarni e'tiborsiz qoldiramiz
  const reply = buildReplyKeyboard();
  await ctx.reply("Do'konni ochish uchun pastdagi tugmani bosing yoki /start ni yuboring.", {
    reply_markup: reply,
  });
});

// Global xatoliklarni ushlash
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Update ${ctx?.update?.update_id} da xatolik:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Telegram API xatosi:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Telegram bilan ulanish xatosi:', e);
  } else {
    console.error('Noma\'lum xatolik:', e);
  }
});

async function startBot() {
  // Chat menyu tugmasini (pastki chap burchak) web ilovaga sozlaymiz
  if (isHttps) {
    try {
      await bot.api.setChatMenuButton({
        menu_button: {
          type: 'web_app',
          text: 'TillaBazar',
          web_app: { url: WEBAPP_URL },
        },
      });
    } catch (err) {
      console.warn('Menyu tugmasini sozlashda ogohlantirish:', err?.description || err);
    }
  }

  await bot.api.setMyCommands([
    { command: 'start', description: "Botni ishga tushirish / Do'konni ochish" },
    { command: 'help', description: 'Yordam' },
  ]);

  console.log('🤖 Bot ishga tushdi (long polling)...');
  await bot.start();
}

startBot().catch((err) => {
  console.error('Botni ishga tushirishda xatolik:', err);
  process.exit(1);
});

// Toza to'xtatish
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
