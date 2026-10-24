const router = require('express').Router();
const pool = require('../config/db');
const bot = require('../services/telegramBot');

const q = (sql, p) => pool.query(sql, p).then((r) => r.rows);
const h = (fn) => (req, res) => fn(req, res).catch((e) => { console.error(e); res.status(500).json({ error: e.message }); });

// ---------- লগইন ----------
router.get('/config', (_req, res) => res.json({ botUsername: bot.state.username }));
router.post('/login', (req, res) => {
  if (!bot.verifyLogin(req.body)) return res.status(401).json({ error: 'টেলিগ্রাম লগইন যাচাই হয়নি' });
  const u = req.body;
  res.json({ user: { id: u.id, name: [u.first_name, u.last_name].filter(Boolean).join(' '), username: u.username || '', photo_url: u.photo_url || '' } });
});

// ---------- বট কানেক্ট ----------
router.get('/bots', h(async (_req, res) =>
  res.json(await q("SELECT id, page_name, platform_page_id FROM channels WHERE platform='telegram' ORDER BY id"))));

router.post('/bots', h(async (req, res) => {
  const token = String(req.body?.token || '').trim();
  if (!/^\d+:[\w-]{30,}$/.test(token)) return res.status(400).json({ error: 'টোকেনের ফরম্যাট ঠিক নেই (BotFather থেকে পুরোটা কপি করুন)' });
  try { res.status(201).json(await bot.connectBot(token)); }
  catch (e) { res.status(400).json({ error: 'টোকেন গ্রহণযোগ্য নয়: ' + e.message }); }
}));

router.delete('/bots/:id', h(async (req, res) => { await bot.removeBot(req.params.id); res.json({ success: true }); }));

// ---------- অটোমেশন ----------
router.patch('/flows/:id', h(async (req, res) =>
  res.json((await q('UPDATE flows SET is_active = NOT is_active WHERE id=$1 RETURNING id, is_active', [req.params.id]))[0] || {})));
router.delete('/flows/:id', h(async (req, res) => { await q('DELETE FROM flows WHERE id=$1', [req.params.id]); res.json({ success: true }); }));

router.get('/:cid/flows', h(async (req, res) =>
  res.json(await q('SELECT * FROM flows WHERE channel_id=$1 ORDER BY id DESC', [req.params.cid]))));

router.post('/:cid/flows', h(async (req, res) => {
  const b = req.body || {};
  const type = ['keyword', 'welcome', 'default'].includes(b.trigger_type) ? b.trigger_type : 'keyword';
  if (!b.reply?.trim()) return res.status(400).json({ error: 'রিপ্লাই মেসেজ লিখুন' });
  if (type === 'keyword' && !b.trigger_keyword?.trim()) return res.status(400).json({ error: 'কীওয়ার্ড লিখুন' });
  const buttons = (Array.isArray(b.buttons) ? b.buttons : [])
    .filter((x) => x && x.text?.trim() && (x.url?.trim() || x.keyword?.trim()))
    .slice(0, 6)
    .map((x) => ({ text: x.text.trim(), ...(x.url?.trim() ? { url: x.url.trim() } : { keyword: x.keyword.trim() }) }));
  const data = { replyText: b.reply.trim(), imageUrl: b.image_url?.trim() || null, buttons, addTag: b.add_tag?.trim() || null };
  const rows = await q(
    'INSERT INTO flows (channel_id, name, flow_data, trigger_type, trigger_keyword) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.params.cid, (b.name || b.trigger_keyword || type).trim(), JSON.stringify(data), type, type === 'keyword' ? b.trigger_keyword.trim() : null]
  );
  res.status(201).json(rows[0]);
}));

// ---------- লাইভ চ্যাট ----------
router.get('/chats/:sid/messages', h(async (req, res) =>
  res.json(await q('SELECT id, sender_type, message_text, created_at FROM messages WHERE subscriber_id=$1 ORDER BY created_at ASC, id ASC LIMIT 500', [req.params.sid]))));

router.post('/chats/:sid/send', h(async (req, res) => {
  const text = req.body?.text?.trim();
  if (!text) return res.status(400).json({ error: 'মেসেজ লিখুন' });
  const s = (await q('SELECT s.id, s.psid, s.channel_id, c.access_token FROM subscribers s JOIN channels c ON c.id=s.channel_id WHERE s.id=$1', [req.params.sid]))[0];
  if (!s) return res.status(404).json({ error: 'কন্টাক্ট পাওয়া যায়নি' });
  try { await bot.tg(s.access_token, 'sendMessage', { chat_id: s.psid, text }); }
  catch (e) { return res.status(502).json({ error: 'টেলিগ্রাম পাঠাতে পারেনি: ' + e.message }); }
  await q("INSERT INTO messages (channel_id, subscriber_id, sender_type, message_text, message_type) VALUES ($1,$2,'admin',$3,'text')", [s.channel_id, s.id, text]);
  await q('UPDATE subscribers SET bot_paused=TRUE WHERE id=$1', [s.id]);
  res.json({ success: true });
}));

router.patch('/chats/:sid/pause', h(async (req, res) => {
  await q('UPDATE subscribers SET bot_paused=$1 WHERE id=$2', [!!req.body?.paused, req.params.sid]);
  res.json({ success: true });
}));

router.get('/:cid/chats', h(async (req, res) =>
  res.json(await q(
    `SELECT s.id, s.psid, s.first_name, s.bot_paused, lm.message_text AS last_message, lm.created_at AS last_at
     FROM subscribers s
     LEFT JOIN LATERAL (SELECT message_text, created_at FROM messages m WHERE m.subscriber_id = s.id ORDER BY created_at DESC, id DESC LIMIT 1) lm ON TRUE
     WHERE s.channel_id=$1 ORDER BY COALESCE(lm.created_at, s.created_at) DESC LIMIT 200`, [req.params.cid]))));

// ---------- কন্টাক্ট ও ট্যাগ ----------
router.get('/:cid/contacts', h(async (req, res) =>
  res.json(await q(
    `SELECT s.id, s.first_name, s.psid, s.created_at,
            COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
     FROM subscribers s
     LEFT JOIN subscriber_tags st ON st.subscriber_id = s.id
     LEFT JOIN tags t ON t.id = st.tag_id
     WHERE s.channel_id=$1 GROUP BY s.id ORDER BY s.id DESC LIMIT 500`, [req.params.cid]))));

router.get('/:cid/tags', h(async (req, res) =>
  res.json(await q('SELECT id, name FROM tags WHERE channel_id=$1 ORDER BY name', [req.params.cid]))));

router.post('/:cid/tags', h(async (req, res) => {
  const name = req.body?.name?.trim();
  if (!name) return res.status(400).json({ error: 'ট্যাগের নাম দিন' });
  const ex = await q('SELECT id, name FROM tags WHERE channel_id=$1 AND name=$2', [req.params.cid, name]);
  if (ex[0]) return res.json(ex[0]);
  res.status(201).json((await q('INSERT INTO tags (channel_id, name) VALUES ($1,$2) RETURNING id, name', [req.params.cid, name]))[0]);
}));

router.delete('/tags/:id', h(async (req, res) => { await q('DELETE FROM tags WHERE id=$1', [req.params.id]); res.json({ success: true }); }));

router.post('/contacts/:sid/tags', h(async (req, res) => {
  await q('INSERT INTO subscriber_tags (subscriber_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.params.sid, req.body?.tag_id]);
  res.json({ success: true });
}));
router.delete('/contacts/:sid/tags/:tid', h(async (req, res) => {
  await q('DELETE FROM subscriber_tags WHERE subscriber_id=$1 AND tag_id=$2', [req.params.sid, req.params.tid]);
  res.json({ success: true });
}));

// ---------- ব্রডকাস্ট ----------
router.get('/:cid/broadcasts', h(async (req, res) =>
  res.json(await q('SELECT * FROM broadcasts WHERE channel_id=$1 ORDER BY id DESC LIMIT 50', [req.params.cid]))));

router.post('/:cid/broadcasts', h(async (req, res) => {
  const { name, message, tag_id } = req.body || {};
  if (!message?.trim()) return res.status(400).json({ error: 'মেসেজ লিখুন' });
  const ch = (await q("SELECT id, access_token FROM channels WHERE id=$1 AND platform='telegram'", [req.params.cid]))[0];
  if (!ch) return res.status(404).json({ error: 'বট পাওয়া যায়নি' });
  const b = (await q('INSERT INTO broadcasts (channel_id, name, message_text, tag_id) VALUES ($1,$2,$3,$4) RETURNING *', [ch.id, name || 'Broadcast', message.trim(), tag_id || null]))[0];
  res.status(202).json(b);
  bot.broadcast(ch, b.id, b.message_text, tag_id || null).catch((e) => console.error('Broadcast error:', e.message));
}));

// ---------- পরিসংখ্যান ----------
router.get('/:cid/stats', h(async (req, res) => {
  const id = req.params.cid;
  const one = async (sql) => (await q(sql, [id]))[0].n;
  res.json({
    subscribers: await one('SELECT COUNT(*)::int AS n FROM subscribers WHERE channel_id=$1'),
    messages: await one('SELECT COUNT(*)::int AS n FROM messages WHERE channel_id=$1'),
    flows: await one('SELECT COUNT(*)::int AS n FROM flows WHERE channel_id=$1 AND is_active'),
  });
}));

module.exports = router;
