const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const path = require('path');

// ===== SOZLAMALAR — BU YERLARNI TO'LDIRING =====
const BOT_TOKEN = process.env.BOT_TOKEN || 'TOKENINGIZ';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '8767757466';
const ADMIN_PWD = process.env.ADMIN_PWD || 'sophia2024';
const PORT = process.env.PORT || 3000;
// ===============================================

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();
app.use(express.json());

// Static fayllar
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use(express.static(path.join(__dirname, '../miniapp')));

// ===== MA'LUMOTLAR BAZASI (JSON fayl) =====
const DB_FILE = path.join(__dirname, 'db.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const init = { products: [], orders: [], nextProductId: 1, nextOrderId: 1 };
    fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
    return init;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ===== MAHSULOTLAR API =====

// Barcha mahsulotlar
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

// Mahsulot qo'shish
app.post('/api/products', (req, res) => {
  const db = readDB();
  const prod = { ...req.body, id: db.nextProductId++ };
  db.products.push(prod);
  writeDB(db);
  res.json(prod);
});

// Mahsulot tahrirlash
app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Topilmadi' });
  db.products[idx] = { ...db.products[idx], ...req.body };
  writeDB(db);
  res.json(db.products[idx]);
});

// Mahsulot o'chirish
app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  db.products = db.products.filter(p => p.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// ===== BUYURTMALAR API =====

// Barcha buyurtmalar
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

// Yangi buyurtma
app.post('/api/order', async (req, res) => {
  const db = readDB();
  const order = {
    ...req.body,
    id: db.nextOrderId++,
    done: false,
    createdAt: new Date().toISOString()
  };
  db.orders.push(order);
  writeDB(db);

  // Admin ga Telegram xabari
  const items = (order.cart || [])
    .map(i => `  • ${i.name} (${i.size}) x${i.qty} — ${(i.price * i.qty).toLocaleString()} so'm`)
    .join('\n');

  const msg = `
🛍 *YANGI BUYURTMA #${order.id}*

👤 *Ism:* ${order.name}
📞 *Telefon:* ${order.phone}
📍 *Shahar:* ${order.city}
🏠 *Manzil:* ${order.address}
💳 *To'lov:* ${(order.pay || '').toUpperCase()}

📦 *Mahsulotlar:*
${items}

💵 *JAMI: ${Number(order.total || 0).toLocaleString()} so'm*
  `.trim();

  try {
    await bot.sendMessage(ADMIN_CHAT_ID, msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Bajarildi', callback_data: `done_${order.id}` }
        ]]
      }
    });
  } catch (e) {
    console.error('Bot xabari yuborilmadi:', e.message);
  }

  res.json({ success: true, orderId: order.id });
});

// Buyurtmani bajarildi qilish
app.put('/api/orders/:id/done', (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const order = db.orders.find(o => o.id === id);
  if (order) { order.done = true; writeDB(db); }
  res.json({ success: true });
});

// ===== BOT =====

// /start
bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || "Do'st";
  const MINI_APP_URL = process.env.MINI_APP_URL || `https://sophialishop.onrender.com`;
  
  bot.sendMessage(msg.chat.id,
    `Salom, ${name}! 👋\n\n🎽 *SophiaShop*\nOriginal print futbolkalar\n\n✅ 38 ta noyob dizayn\n🚀 Yetkazib berish: 1-2 kun\n📦 Butun O'zbekiston bo'ylab\n💳 Click va Payme qabul qilinadi`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: "🛍 Do'konga kirish", web_app: { url: MINI_APP_URL } }
        ]]
      }
    }
  );
});

// Callback — buyurtmani bajarildi qilish
bot.on('callback_query', async (query) => {
  if (query.data.startsWith('done_')) {
    const orderId = Number(query.data.replace('done_', ''));
    const db = readDB();
    const order = db.orders.find(o => o.id === orderId);
    if (order) {
      order.done = true;
      writeDB(db);
      await bot.answerCallbackQuery(query.id, { text: '✅ Bajarildi!' });
      await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      });
      await bot.sendMessage(query.message.chat.id, `✅ Buyurtma #${orderId} bajarildi deb belgilandi!`);
    }
  }
});

// /stats — statistika
bot.onText(/\/stats/, (msg) => {
  if (String(msg.chat.id) !== String(ADMIN_CHAT_ID)) return;
  const db = readDB();
  const total = db.orders.length;
  const done = db.orders.filter(o => o.done).length;
  const revenue = db.orders.filter(o => o.done).reduce((s, o) => s + (o.total || 0), 0);
  bot.sendMessage(msg.chat.id,
    `📊 *Statistika*\n\n🎽 Mahsulotlar: ${db.products.length}\n📦 Jami buyurtmalar: ${total}\n✅ Bajarilgan: ${done}\n💵 Daromad: ${revenue.toLocaleString()} so'm`,
    { parse_mode: 'Markdown' }
  );
});

// ===== SERVER =====
app.listen(PORT, () => {
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`🛍 Mini App: http://localhost:${PORT}`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
});
