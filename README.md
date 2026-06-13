# 💎 TillaBazar — Telegram Mini App + Bot

Tilla va kumush buyumlar onlayn bozori. Loyiha ikki qismdan iborat va **bitta servis** sifatida ishga tushadi:

- **`webapp/`** — React + Vite frontend (Telegram Mini App, ya'ni Telegram ichida ochiladigan ilova).
- **`server.js`** — Express + [grammY](https://grammy.dev) bot. Tayyor frontend'ni serve qiladi va Telegram botni ishlatadi.

> Bitta deploy = bitta HTTPS manzil. Bot va ilova bir joyda ishlaydi.

---

## 🚀 Tez ishga tushirish (3 qadam)

### 1-qadam: BotFather'dan token oling
1. Telegram'da [@BotFather](https://t.me/BotFather) ga `/newbot` yuboring.
2. Bot nomi va username bering.
3. Sizga **token** beradi: `123456789:AAE...` — uni saqlang.

### 2-qadam: Adminning Chat ID sini oling (arizalar shu yerga keladi)
- [@userinfobot](https://t.me/userinfobot) ga `/start` yuboring → u sizning **Chat ID** raqamingizni ko'rsatadi.

### 3-qadam: Render.com ga deploy qiling (bepul, eng oson)
1. Bu repo'ni o'z GitHub akkauntingizga oling.
2. [Render.com](https://render.com) → **New +** → **Blueprint** → repo'ni tanlang (repo'da `render.yaml` bor).
3. Quyidagi muhit o'zgaruvchilarini kiriting:
   | O'zgaruvchi | Qiymat |
   |-------------|--------|
   | `BOT_TOKEN` | BotFather token |
   | `ADMIN_CHAT_ID` | Sizning Chat ID |
   | `WEBAPP_URL` | Deploy tugagach beriladigan URL (masalan `https://tillabazar-bot.onrender.com`) |
4. Birinchi deploy tugagach, Render sizga `https://...onrender.com` manzilini beradi.
   Shu manzilni `WEBAPP_URL` ga yozing va **qayta deploy** qiling (Manual Deploy).

Tayyor! Endi botingizga `/start` yuboring — **"🛒 Do'konni ochish"** tugmasi chiqadi.

---

## ⚙️ Muhit o'zgaruvchilari (.env)

`.env.example` ni nusxalab `.env` yarating:

```bash
cp .env.example .env
```

| O'zgaruvchi | Majburiy | Tavsif |
|-------------|:---:|--------|
| `BOT_TOKEN` | ✅ | BotFather'dan olingan token |
| `WEBAPP_URL` | ✅ | Ilova ochiladigan **HTTPS** manzil |
| `ADMIN_CHAT_ID` | ⭐ | Sotish/buyback arizalari yuboriladigan chat |
| `PORT` | ➖ | Server porti (Render o'zi belgilaydi) |

---

## 💻 Lokal (kompyuterda) ishga tushirish

> Telegram tugmalari faqat **HTTPS** manzil bilan ishlaydi. Lokal test uchun frontend'ni alohida `npm run dev` bilan brauzerda ko'rishingiz mumkin, lekin Telegram ichida sinash uchun deploy (yoki `ngrok` kabi HTTPS tunnel) kerak.

Frontend'ni alohida ko'rish:
```bash
cd webapp
npm install
npm run dev      # http://localhost:3000
```

To'liq servis (build + bot):
```bash
npm install          # root: express, grammy, dotenv
npm run build        # webapp/dist ni yaratadi
npm start            # server.js — ilova + bot
```

---

## 🧩 Botda nima ishlaydi

- `/start` → salomlashish + **"Do'konni ochish"** tugmasi (inline + doimiy klaviatura).
- `/help` → yordam.
- Chat menyu tugmasi (pastki chap burchak) ilovani ochadi.
- Ilovadagi **Sotish** (`SellModal`) va **Bizga sotish** (`RatesModal`) formalari `Telegram.WebApp.sendData()` orqali botga yuboriladi → bot ularni **`ADMIN_CHAT_ID`** ga jo'natadi.

> ⚠️ **Muhim:** `sendData()` faqat ilova **klaviatura tugmasi** (pastdagi "🛒 Do'konni ochish") orqali ochilganda ishlaydi. Inline tugma yoki menyu tugmasi orqali ochilganda forma adminga bormaydi — bu Telegram'ning o'zining cheklovi.

---

## 🛠 Tuzatilgan muammolar

Avvalgi holatda bot umuman ishlamasdi. Quyidagilar tuzatildi:

- ✅ **Bot backend yo'q edi** — to'liq grammY bot yozildi (`/start`, web_app tugmalar, arizalarni adminga yuborish).
- ✅ **`Telegram.WebApp.ready()` / `expand()` chaqirilmagandi** — ilova endi to'g'ri ishga tushadi.
- ✅ **`index.html` mavjud bo'lmagan `/index.css` ga murojaat qilardi** — olib tashlandi.
- ✅ **Importmap (esm.sh) Vite build bilan ziddiyatga olib kelishi mumkin edi** — olib tashlandi.
- ✅ **Kod faqat zip ichida edi** — normal loyiha tuzilishiga keltirildi (`webapp/`).
- ✅ **Gemini AI kaliti bo'lmasa xato berishi mumkin edi** — endi xavfsiz (lazy init).

---

## 📁 Tuzilish

```
.
├── server.js          # Express + grammY bot (asosiy kirish nuqtasi)
├── package.json       # root: express, grammy, dotenv
├── render.yaml        # Render.com deploy konfiguratsiyasi
├── .env.example       # sozlamalar namunasi
└── webapp/            # React + Vite frontend (Telegram Mini App)
    ├── index.html
    ├── index.tsx      # Telegram WebApp init + React mount
    ├── App.tsx
    ├── components/
    ├── services/
    └── ...
```
