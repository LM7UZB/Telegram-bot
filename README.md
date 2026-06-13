# 💎 TillaBazar — Telegram Mini App (Web App)

Tilla va kumush buyumlar onlayn bozori — **Telegram Mini App** (Telegram ichida ochiladigan ilova).

> ✅ **Server kerak emas.** Hammasi bepul Vercel'da ishlaydi: do'kon statik hosting'da, arizalar esa serverless funksiya orqali adminga boradi. Botni ochish tugmasi BotFather orqali sozlanadi (kod yozmasdan).

---

## 🚀 To'liq ishga tushirish — 4 qadam (serversiz)

### 1-qadam — Bot tokeningiz (sizda bor ✅)
[@BotFather](https://t.me/BotFather) bergan token: `123456789:AAE...`

### 2-qadam — Admin Chat ID ni oling
[@userinfobot](https://t.me/userinfobot) ga `/start` yuboring → u sizning **Chat ID** raqamingizni ko'rsatadi (masalan `123456789`). Arizalar shu chatga keladi.

### 3-qadam — Vercel'ga deploy qiling (bepul, serversiz)
1. Bu repo'ni o'z GitHub akkauntingizga oling.
2. [vercel.com](https://vercel.com) → **Add New → Project** → repo'ni import qiling.
3. **Muhim sozlamalar:**
   - **Root Directory:** `webapp` (Edit tugmasi orqali tanlang)
   - Framework: **Vite** (avtomatik aniqlanadi)
4. **Environment Variables** bo'limiga qo'shing:
   | Nomi | Majburiy | Qiymat |
   |------|:---:|--------|
   | `BOT_TOKEN` | ✅ | BotFather token |
   | `ADMIN_CHAT_ID` | ➖ | Buyurtmalar keladigan chat. Bo'sh qoldirsangiz — asosiy admin `@LM7_UZB` (147775103) ga keladi |
5. **Deploy** bosing. Tugagach sizga manzil beradi, masalan: `https://tillabazar.vercel.app`

### 4-qadam — BotFather'da "Do'konni ochish" tugmasini sozlang
[@BotFather](https://t.me/BotFather) ga kiring:
1. `/mybots` → botingizni tanlang → **Bot Settings** → **Menu Button** → **Configure Menu Button**
2. URL kiriting: Vercel bergan manzil (masalan `https://tillabazar.vercel.app`)
3. Tugma nomi: `🛒 Do'kon`

✅ **Tayyor!** Endi botingizga kiring — pastda "🛒 Do'kon" tugmasi chiqadi, bosilganda TillaBazar ochiladi. Sotish/Buyback arizalari avtomatik sizning (admin) chatingizga keladi.

---

## ⚙️ Qanday ishlaydi (texnik)

```
Telegram  ──(Menu Button)──►  Vercel'dagi Web App (do'kon)
                                     │
                       forma to'ldiriladi
                                     ▼
                          POST /api/notify  (Vercel serverless)
                                     │
                          Telegram Bot API
                                     ▼
                            Admin chatiga xabar
```

- `webapp/` — React + Vite frontend (do'kon).
- `webapp/api/notify.js` — Vercel serverless funksiyasi; formalarni Bot API orqali adminga yuboradi. **Bot tokeni faqat shu yerda (server tomonda) ishlatiladi — xavfsiz.**

### 👑 Admin huquqlari
- **Asosiy admin:** `@LM7_UZB` (Telegram ID `147775103`). Kod: `webapp/utils/telegram.ts` → `ADMIN_IDS`.
- Adminga **hamma narsa** keladi: 🛒 buyurtmalar (naqd / karta / muddatli), 💎 yangi mahsulot qo'shish, 🔔 "bizga sotish" arizalari — har birida mijozning Telegram ismi, username va ID si bo'ladi.
- **Faqat admin** narxlarni (kurslar) tahrirlay oladi. Oddiy foydalanuvchilarda bu tugma ko'rinmaydi.
- Yangi admin qo'shish: `ADMIN_IDS` ro'yxatiga uning Telegram ID sini qo'shing.

---

## 🛠 Tuzatilgan muammolar

| Muammo | Holat |
|--------|:---:|
| Bot/forma backendi yo'q edi | ✅ Serverless `/api/notify` qo'shildi |
| `Telegram.WebApp.ready()` / `expand()` chaqirilmagandi | ✅ Qo'shildi — ilova to'g'ri ochiladi |
| `sendData()` formani yuborganda ilovani darrov yopib yuborardi | ✅ `/api/notify` ga o'tkazildi |
| `index.html` mavjud bo'lmagan `/index.css` ni so'rardi | ✅ Olib tashlandi |
| Vite bilan ziddiyatli importmap (esm.sh) | ✅ Olib tashlandi |
| Kod faqat zip ichida edi | ✅ Normal tuzilish (`webapp/`) |
| Gemini AI kaliti yo'qligida ilova qulashi mumkin edi | ✅ Xavfsiz (lazy init) |

---

## 📁 Tuzilish

```
.
├── README.md
├── webapp/                 # ⭐ Vercel shu papkani deploy qiladi
│   ├── api/
│   │   └── notify.js       # serverless: forma -> admin
│   ├── index.html
│   ├── index.tsx           # Telegram WebApp init + React mount
│   ├── App.tsx
│   ├── components/
│   ├── services/
│   ├── constants.ts
│   └── ...
├── server.js               # (IXTIYORIY) o'z serveringiz bo'lsa — pastga qarang
├── render.yaml
└── .env.example
```

---

## 🧰 (Ixtiyoriy) O'z serveringiz bo'lsa

Agar kelajakda doimiy serveringiz bo'lsa (Render/Railway/VPS), `server.js` to'liq grammY botni (long polling) ishlatadi va frontend'ni o'zi serve qiladi. Batafsil: `render.yaml` va `.env.example` ga qarang. **Vercel yo'li uchun bu kerak emas.**

---

## 📲 Keyingi bosqich — to'liq mobil ilova

Web App barqaror ishlagach, uni to'liq mobil ilovaga (Android/iOS) aylantirish mumkin.
Eng oson yo'l — **Capacitor** (shu React kodini deyarli o'zgartirmasdan ilovaga o'raydi).
Bu bosqichni Web App tayyor bo'lib, test qilingach boshlaymiz.
