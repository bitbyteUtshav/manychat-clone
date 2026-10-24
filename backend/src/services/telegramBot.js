require('dotenv').config();
const crypto = require('crypto');
const pool = require('../config/db');

const LOGIN_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const state = { username: null };
const running = new Map(); // channelId -> { stop }
const FALLBACK = 'ধন্যবাদ! আপনার মেসেজটি আমরা পেয়েছি। আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবে।';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tg(token, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}),
  });
  const d = await r.json();
  if (!d.ok) throw new Error(d.description || 'Telegram API error');
  return d.result;
}

async function ensureSchema() {
  const stmts = [
    'ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS bot_paused BOOLEAN DEFAULT FALSE',
    'ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMP',
    `CREATE TABLE IF NOT EXISTS tags (id SERIAL PRIMARY KEY, channel_id INT REFERENCES channels(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, color VARCHAR(50) DEFAULT 'blue')`,
    `ALTER TABLE tags ADD COLUMN IF NOT EXISTS color VARCHAR(50) DEFAULT 'blue'`,
    'CREATE TABLE IF NOT EXISTS subscriber_tags (subscriber_id INT REFERENCES subscribers(id) ON DELETE CASCADE, tag_id INT REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (subscriber_id, tag_id))',
    `CREATE TABLE IF NOT EXISTS broadcasts (id SERIAL PRIMARY KEY, channel_id INT REFERENCES channels(id) ON DELETE CASCADE, name VARCHAR(255), message_text TEXT NOT NULL, tag_id INT, status VARCHAR(30) DEFAULT 'sending', sent_count INT DEFAULT 0, failed_count INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  ];
  for (const s of stmts) {
    try { await pool.query(s); } catch (e) { console.warn('schema warning:', e.message.split('\n')[0]); }
  }
}

const logMsg = (channelId, subId, type, text, kind = 'text') =>
  pool.query(
    'INSERT INTO messages (channel_id, subscriber_id, sender_type, message_text, message_type) VALUES ($1,$2,$3,$4,$5)',
    [channelId, subId, type, text, kind]
  );

async function applyTag(channelId, subId, name) {
  if (!name) return;
  let tag = (await pool.query('SELECT id FROM tags WHERE channel_id=$1 AND name=$2', [channelId, name])).rows[0];
  if (!tag) tag = (await pool.query('INSERT INTO tags (channel_id, name) VALUES ($1,$2) RETURNING id', [channelId, name])).rows[0];
  await pool.query('INSERT INTO subscriber_tags (subscriber_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [subId, tag.id]);
}

function keyboard(flow) {
  const btns = (flow?.flow_data?.buttons || []).filter((b) => b.text && (b.url || b.keyword));
  if (!btns.length) return undefined;
  return {
    inline_keyboard: btns.map((b, i) => [
      b.url ? { text: b.text, url: b.url } : { text: b.text, callback_data: `cb:${flow.id}:${i}` },
    ]),
  };
}

async function sendFlow(token, chatId, text, flow) {
  const markup = keyboard(flow);
  const img = flow?.flow_data?.imageUrl;
  if (img) return tg(token, 'sendPhoto', { chat_id: chatId, photo: img, caption: text, reply_markup: markup });
  return tg(token, 'sendMessage', { chat_id: chatId, text, reply_markup: markup });
}

async function pickFlow(channelId, text, isStart) {
  const flows = (await pool.query('SELECT * FROM flows WHERE channel_id=$1 AND is_active=TRUE ORDER BY id', [channelId])).rows;
  const low = text.trim().toLowerCase();
  const kw = flows.filter((f) => f.trigger_type === 'keyword' && f.trigger_keyword);
  const keys = (f) => f.trigger_keyword.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return (
    (isStart && flows.find((f) => f.trigger_type === 'welcome')) ||
    kw.find((f) => keys(f).includes(low)) ||
    kw.find((f) => keys(f).some((k) => low.includes(k))) ||
    flows.find((f) => f.trigger_type === 'default') ||
    null
  );
}

async function handleText(ch, from, chatId, text) {
  const psid = String(chatId);
  const name = [from?.first_name, from?.last_name].filter(Boolean).join(' ') || 'User';
  let sub = (await pool.query('SELECT id, bot_paused FROM subscribers WHERE channel_id=$1 AND psid=$2', [ch.id, psid])).rows[0];
  if (!sub) {
    sub = (await pool.query(
      'INSERT INTO subscribers (channel_id, psid, first_name, status) VALUES ($1,$2,$3,$4) RETURNING id, bot_paused',
      [ch.id, psid, name, 'active']
    )).rows[0];
  }
  await logMsg(ch.id, sub.id, 'subscriber', text);
  await pool.query('UPDATE subscribers SET last_interaction_at = NOW() WHERE id=$1', [sub.id]);

  const start = text.match(/^\/start(?:@\w+)?(?:\s+(.+))?$/);
  if (start && start[1]) await applyTag(ch.id, sub.id, `source:${start[1].slice(0, 40)}`);
  if (sub.bot_paused) return; // এজেন্ট লাইভ চ্যাট করছে

  const flow = await pickFlow(ch.id, text, !!start);
  const reply = flow?.flow_data?.replyText || FALLBACK;
  await sendFlow(ch.access_token, chatId, reply, flow);
  await logMsg(ch.id, sub.id, 'bot', reply);
  if (flow?.flow_data?.addTag) await applyTag(ch.id, sub.id, flow.flow_data.addTag);
}

async function handleCallback(ch, cq) {
  tg(ch.access_token, 'answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});
  const m = /^cb:(\d+):(\d+)$/.exec(cq.data || '');
  if (!m || !cq.message) return;
  const f = (await pool.query('SELECT flow_data FROM flows WHERE id=$1 AND channel_id=$2', [m[1], ch.id])).rows[0];
  const kw = f?.flow_data?.buttons?.[Number(m[2])]?.keyword;
  if (kw) await handleText(ch, cq.from, cq.message.chat.id, kw);
}

async function poll(ch, ctl) {
  let offset = 0;
  while (!ctl.stop) {
    try {
      const updates = await tg(ch.access_token, 'getUpdates', { offset, timeout: 25, allowed_updates: ['message', 'callback_query'] });
      for (const u of updates) {
        offset = u.update_id + 1;
        try {
          if (u.message?.text && u.message.chat.type === 'private') await handleText(ch, u.message.from, u.message.chat.id, u.message.text);
          else if (u.callback_query) await handleCallback(ch, u.callback_query);
        } catch (e) { console.error('Telegram handle error:', e.message); }
      }
    } catch (e) {
      if (ctl.stop) break;
      console.error('Telegram polling error:', e.message);
      await sleep(5000);
    }
  }
}

async function startBot(ch) {
  if (running.has(ch.id)) return;
  const ctl = { stop: false };
  running.set(ch.id, ctl);
  try { await tg(ch.access_token, 'deleteWebhook'); } catch (e) { console.error('deleteWebhook:', e.message); }
  poll(ch, ctl);
}

async function connectBot(token) {
  const me = await tg(token, 'getMe');
  const pid = String(me.id), pname = `Telegram @${me.username}`;
  const ex = await pool.query('SELECT id FROM channels WHERE platform_page_id=$1', [pid]);
  let id;
  if (ex.rows[0]) {
    id = ex.rows[0].id;
    await pool.query('UPDATE channels SET access_token=$1, page_name=$2 WHERE id=$3', [token, pname, id]);
    const old = running.get(id); if (old) { old.stop = true; running.delete(id); }
  } else {
    id = (await pool.query(
      "INSERT INTO channels (platform, platform_page_id, page_name, access_token) VALUES ('telegram',$1,$2,$3) RETURNING id",
      [pid, pname, token]
    )).rows[0].id;
  }
  await startBot({ id, access_token: token });
  console.log(`🤖 Telegram বট চালু: @${me.username}`);
  return { id, username: me.username, name: me.first_name };
}

async function removeBot(id) {
  const c = running.get(Number(id)); if (c) { c.stop = true; running.delete(Number(id)); }
  await pool.query("DELETE FROM channels WHERE id=$1 AND platform='telegram'", [id]);
}

async function broadcast(ch, broadcastId, text, tagId) {
  const params = [ch.id];
  let sql = 'SELECT s.id, s.psid FROM subscribers s WHERE s.channel_id=$1';
  if (tagId) {
    params.push(tagId);
    sql += ' AND EXISTS (SELECT 1 FROM subscriber_tags st WHERE st.subscriber_id=s.id AND st.tag_id=$2)';
  }
  const subs = (await pool.query(sql, params)).rows;
  let sent = 0, failed = 0;
  for (const s of subs) {
    try {
      await tg(ch.access_token, 'sendMessage', { chat_id: s.psid, text });
      await logMsg(ch.id, s.id, 'bot', text, 'broadcast');
      sent++;
    } catch { failed++; }
    await sleep(60);
  }
  await pool.query("UPDATE broadcasts SET status='done', sent_count=$1, failed_count=$2 WHERE id=$3", [sent, failed, broadcastId]);
}

async function startAll() {
  try {
    await ensureSchema();
    if (LOGIN_TOKEN) {
      try { state.username = (await tg(LOGIN_TOKEN, 'getMe')).username; await connectBot(LOGIN_TOKEN); }
      catch (e) { console.error('লগইন বট শুরু হয়নি:', e.message); }
    }
    const rows = (await pool.query("SELECT id, access_token FROM channels WHERE platform='telegram'")).rows;
    for (const ch of rows) await startBot(ch);
  } catch (e) { console.error('Telegram শুরু করা যায়নি:', e.message); }
}

// টেলিগ্রাম লগইন উইজেটের ডেটা যাচাই
function verifyLogin(data) {
  if (!LOGIN_TOKEN || !data || !data.hash) return false;
  const { hash, ...rest } = data;
  const check = Object.keys(rest).sort().map((k) => `${k}=${rest[k]}`).join('\n');
  const secret = crypto.createHash('sha256').update(LOGIN_TOKEN).digest();
  const h = crypto.createHmac('sha256', secret).update(check).digest('hex');
  return h === hash && Date.now() / 1000 - Number(rest.auth_date) < 86400;
}

module.exports = { startAll, connectBot, removeBot, broadcast, tg, state, verifyLogin };
