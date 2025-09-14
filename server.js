// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // node-fetch@2
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(rateLimit({ windowMs: 60*1000, max: 60 }));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Telegram helper
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(text){
  if(!BOT_TOKEN || !ADMIN_CHAT_ID) throw new Error('Telegram config missing');
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text, parse_mode: 'HTML' })
  });
}

// receive usernames (only)
app.post('/request-access', async (req, res) => {
  try {
    const { requester, target } = req.body || {};
    if (!requester || !target) return res.status(400).json({ error: 'requester and target required' });

    const r = String(requester).slice(0,64).replace(/[^\w@.\- ]/g,'');
    const t = String(target).slice(0,64).replace(/[^\w@.\- ]/g,'');

    const msg = `📬 <b>Access request</b>\nRequester: ${r}\nTarget: ${t}\nTime: ${new Date().toISOString()}`;

    try {
      await sendTelegram(msg);
    } catch (err) {
      console.error('Telegram send failed', err);
      return res.status(502).json({ ok:false, error:'Telegram send failed' });
    }

    return res.json({ ok:true, msg:'Notification sent (usernames only).' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error:'Server error' });
  }
});

// fallback to frontend
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
