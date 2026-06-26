# 🚀 SophiaShop — Ishga Tushirish (Step by Step)

---

## 1-QADAM: Yangi Bot Token oling

1. Telegramda **@BotFather** ga yozing
2. `/revoke` → botingizni tanlang → eski tokenni o'chiring
3. Keyin `/token` yoki `/mybots` → botingizni tanlang → "API Token" → yangi token

---

## 2-QADAM: GitHub ga yuklang (BEPUL)

1. **github.com** ga kiring → ro'yxatdan o'ting
2. **New repository** → nom: `sophialishop` → **Create**
3. Ushbu papkani yuklang (Upload files)

---

## 3-QADAM: Render.com da server

1. **render.com** ga kiring → GitHub bilan login
2. **New** → **Web Service**
3. GitHub repo ni tanlang: `sophialishop`
4. Sozlamalar:
   - **Build Command:** `npm install`
   - **Start Command:** `node bot/server.js`
5. **Environment Variables** bo'limiga qo'shing:
   ```
   BOT_TOKEN = yangi_tokeningiz
   ADMIN_CHAT_ID = 8767757466
   ADMIN_PWD = o'zingizning_parolingiz
   MINI_APP_URL = https://sophialishop-xxxx.onrender.com
   ```
6. **Create Web Service** → kutib turing (2-3 daqiqa)
7. URL olasiz: `https://sophialishop-xxxx.onrender.com`

---

## 4-QADAM: MINI_APP_URL ni yangilang

Render da URL olgach:
- Environment Variables → `MINI_APP_URL` → URL ni kiriting
- **Save** → **Redeploy**

---

## 5-QADAM: Bot ga Mini App ulang

@BotFather ga yozing:
```
/mybots
→ botingizni tanlang
→ Bot Settings
→ Menu Button
→ Configure menu button
→ URL: https://sophialishop-xxxx.onrender.com
→ Matn: 🛍 Do'kon
```

---

## 6-QADAM: Admin panel ochish

Brauzerda: `https://sophialishop-xxxx.onrender.com/admin`

Parol: `server.js` da `ADMIN_PWD` ga yozgan parolingiz

---

## 7-QADAM: Mahsulot qo'shish

1. Admin panelga kiring
2. **+ Qo'shish** tugmasini bosing
3. **Nom** yozing
4. **Narx** yozing: `73000`
5. **Kategoriya** tanlang
6. **Rasm URL** — Uzumdan oling:
   - Uzumda mahsulotingizga kiring
   - Rasmga **o'ng klik** → "Rasm manzilini nusxalash"
   - Admin panelga **joylashtiring**
   - Rasm darhol ko'rinadi ✅
7. **Saqlash** → tayyor!

---

## ✅ Hammasi tayyor!

- Mini App: `https://sophialishop-xxxx.onrender.com`
- Admin: `https://sophialishop-xxxx.onrender.com/admin`
- Bot: Telegramda `/start` yozing

Buyurtma kelganda Telegramga xabar keladi! 🎉

---

## ❓ Muammo bo'lsa:

- Render logs → Deploy → Logs bo'limini tekshiring
- Token noto'g'ri → yangi token oling
- URL noto'g'ri → MINI_APP_URL ni yangilang
