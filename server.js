// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch'); // node-fetch@2
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// rate limiting
app.use(rateLimit({ windowMs: 60 * 1000, max: 60 }));

// Telegram config (from env)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// helper: send message to telegram (HTML mode)
async function sendTelegramMessage(htmlText) {
  if (!BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials missing, not sending message.');
    return { ok: false, error: 'telegram-config-missing' };
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const j = await resp.json().catch(() => null);
    if (!resp.ok || !j || !j.ok) {
      console.warn('Telegram send failed', j);
      return { ok: false, error: j || 'telegram-send-failed' };
    }
    return { ok: true, result: j.result };
  } catch (err) {
    console.error('Telegram send error', err);
    return { ok: false, error: String(err) };
  }
}

// simple in-memory cache
const cache = new Map();
const DEFAULT_TTL = 60 * 1000;
function getCache(k) {
  const v = cache.get(k);
  if (!v) return null;
  if (Date.now() - v.ts > v.ttl) {
    cache.delete(k);
    return null;
  }
  return v.data;
}
function setCache(k, data, ttl = DEFAULT_TTL) {
  cache.set(k, { ts: Date.now(), ttl, data });
}

// fetch public info helper (tries JSON endpoint, then HTML fallbacks)
async function fetchInstagramPublic(username) {
  username = String(username || '').replace(/^@/, '').trim();
  if (!username) throw new Error('invalid username');

  const key = `ig:${username.toLowerCase()}`;
  const cached = getCache(key);
  if (cached) return cached;

  const base = `https://www.instagram.com/${encodeURIComponent(username)}/`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept-Language': 'en-US,en;q=0.9',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  // 1) try JSON endpoint
  try {
    const jurl = `${base}?__a=1&__d=dis`;
    const r = await fetch(jurl, { headers, redirect: 'follow' });
    if (r.ok) {
      const j = await r.json().catch(() => null);
      const user = j?.graphql?.user || j?.items?.[0] || null;
      if (user) {
        const out = {
          ok: true,
          source: 'json_endpoint',
          username: user.username || username,
          full_name: user.full_name || null,
          biography: user.biography || user.biography_text || null,
          profile_pic_url:
            user.profile_pic_url_hd || user.profile_pic_url || null,
          is_private: !!user.is_private,
          is_verified: !!user.is_verified,
          followers:
            (user.edge_followed_by && user.edge_followed_by.count) ||
            user.followers_count ||
            null,
          following:
            (user.edge_follow && user.edge_follow.count) ||
            user.follows_count ||
            null,
          posts:
            (user.edge_owner_to_timeline_media &&
              user.edge_owner_to_timeline_media.count) ||
            user.media_count ||
            null,
        };
        setCache(key, out);
        return out;
      }
    }
  } catch (e) {
    /* ignore and fallback */
  }

  // 2) fetch HTML and parse embedded JSON
  try {
    const r2 = await fetch(base, { headers, redirect: 'follow' });
    if (!r2.ok)
      return {
        ok: false,
        error: 'profile-not-found-or-blocked',
        status: r2.status,
      };
    const text = await r2.text();

    // window._sharedData
    const shared = text.match(/window\._sharedData\s*=\s*(\{.+?\});/s);
    if (shared && shared[1]) {
      try {
        const sd = JSON.parse(shared[1]);
        const user =
          sd?.entry_data?.ProfilePage?.[0]?.graphql?.user || sd?.graphql?.user;
        if (user) {
          const out = {
            ok: true,
            source: 'shared_data',
            username: user.username || username,
            full_name: user.full_name || null,
            biography: user.biography || null,
            profile_pic_url:
              user.profile_pic_url_hd || user.profile_pic_url || null,
            is_private: !!user.is_private,
            is_verified: !!user.is_verified,
            followers:
              (user.edge_followed_by && user.edge_followed_by.count) || null,
            following:
              (user.edge_follow && user.edge_follow.count) || null,
            posts:
              (user.edge_owner_to_timeline_media &&
                user.edge_owner_to_timeline_media.count) ||
              null,
          };
          setCache(key, out);
          return out;
        }
      } catch (e) {}
    }

    // 3) ld+json fallback
    const ld = text.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i
    );
    if (ld && ld[1]) {
      try {
        const parsed = JSON.parse(ld[1]);
        const out = {
          ok: true,
          source: 'ld_json',
          username: username,
          full_name: parsed.name || null,
          biography: parsed.description || null,
          profile_pic_url: Array.isArray(parsed.image)
            ? parsed.image[0]
            : parsed.image || null,
          is_private: null,
          is_verified: null,
          followers: null,
          following: null,
          posts: null,
        };
        setCache(key, out);
        return out;
      } catch (e) {}
    }

    return { ok: false, error: 'could-not-extract-public-data' };
  } catch (err) {
    return { ok: false, error: 'fetch-error: ' + String(err) };
  }
}

// API: GET /api/profile?username=
app.get('/api/profile', async (req, res) => {
  const username = req.query.username;
  if (!username)
    return res.status(400).json({ ok: false, error: 'username required' });

  try {
    const info = await fetchInstagramPublic(username);
    if (!info.ok) return res.status(404).json(info);
    if (info.is_private)
      return res.json({ ok: false, error: 'profile_private' });

    // send Telegram notification (HTML formatted)
    try {
      const fullName = info.full_name
        ? `<b>${escapeHtml(info.full_name)}</b>\n`
        : '';
      const usernameText = `<b>Username:</b> @${escapeHtml(
        info.username || username
      )}\n`;
      const bioText = `<b>Bio:</b> ${escapeHtml(info.biography || '—')}\n`;
      const followers =
        info.followers != null ? info.followers.toLocaleString() : '—';
      const following =
        info.following != null ? info.following.toLocaleString() : '—';
      const posts = info.posts != null ? info.posts.toLocaleString() : '—';
      const stats = `<b>Followers:</b> ${followers}  •  <b>Following:</b> ${following}  •  <b>Posts:</b> ${posts}\n`;
      const profileLink = `<a href="https://instagram.com/${encodeURIComponent(
        info.username
      )}">https://instagram.com/${escapeHtml(info.username)}</a>`;

      let message = `📬 <b>Public profile fetched</b>\n${fullName}${usernameText}${bioText}${stats}${profileLink}`;
      const tgRes = await sendTelegramMessage(message);

      // Optionally: send profile picture
      if (info.profile_pic_url) {
        try {
          const photoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
          await fetch(photoUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              photo: info.profile_pic_url,
              caption: `📷 Avatar — @${info.username}`,
            }),
          });
        } catch (e) {}
      }

      return res.json({
        ok: true,
        source: info.source,
        username: info.username,
        full_name: info.full_name || null,
        biography: info.biography || null,
        profile_pic_url: info.profile_pic_url || null,
        followers:
          info.followers !== undefined ? info.followers : null,
        following:
          info.following !== undefined ? info.following : null,
        posts: info.posts !== undefined ? info.posts : null,
        telegram_sent: tgRes && tgRes.ok ? true : false,
      });
    } catch (err) {
      console.warn('Telegram notify failed', err);
      return res.json({
        ok: true,
        profile: info,
        telegram_sent: false,
        telegram_error: String(err),
      });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// fallback frontend serve
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// small helper: escape HTML for Telegram message
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
