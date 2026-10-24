require('dotenv').config();
const router = require('express').Router();
const pool = require('../config/db');

const GRAPH = 'https://graph.facebook.com/v18.0';
const REDIRECT = `${process.env.BACKEND_URL}/api/auth/facebook/callback`;
const FRONT = process.env.FRONTEND_URL;

const gj = async (url, opts) => {
  const r = await fetch(url, opts);
  const d = await r.json();
  if (!r.ok || d.error) throw new Error(d.error?.message || `HTTP ${r.status}`);
  return d;
};

router.get('/auth/facebook/callback', async (req, res) => {
  const { code, error_description } = req.query;
  if (!code) return res.redirect(`${FRONT}/?connect_error=${encodeURIComponent(error_description || 'বাতিল করা হয়েছে')}`);
  try {
    const id = process.env.FACEBOOK_APP_ID, secret = process.env.FACEBOOK_APP_SECRET;
    const short = await gj(`${GRAPH}/oauth/access_token?` + new URLSearchParams({ client_id: id, client_secret: secret, redirect_uri: REDIRECT, code }));
    const long = await gj(`${GRAPH}/oauth/access_token?` + new URLSearchParams({ grant_type: 'fb_exchange_token', client_id: id, client_secret: secret, fb_exchange_token: short.access_token }));
    const pages = (await gj(`${GRAPH}/me/accounts?fields=id,name,access_token&limit=100`, { headers: { Authorization: `Bearer ${long.access_token}` } })).data || [];

    for (const p of pages) {
      const ex = await pool.query('SELECT id FROM channels WHERE platform_page_id = $1', [p.id]);
      if (ex.rows[0]) await pool.query('UPDATE channels SET access_token=$1, page_name=$2 WHERE id=$3', [p.access_token, p.name, ex.rows[0].id]);
      else await pool.query("INSERT INTO channels (platform, platform_page_id, page_name, access_token) VALUES ('facebook',$1,$2,$3)", [p.id, p.name, p.access_token]);
      fetch(`${GRAPH}/${p.id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks`, { method: 'POST', headers: { Authorization: `Bearer ${p.access_token}` } })
        .then((r) => r.json()).then((d) => d.error && console.error('Subscribe failed:', p.name, d.error.message)).catch(() => {});
    }
    res.redirect(`${FRONT}/?connected=${pages.length}`);
  } catch (e) {
    console.error('Facebook connect failed:', e.message);
    res.redirect(`${FRONT}/?connect_error=${encodeURIComponent(e.message)}`);
  }
});

router.get('/pages', async (_req, res) => {
  const r = await pool.query('SELECT id, page_name, platform_page_id FROM channels ORDER BY id DESC');
  res.json(r.rows);
});

router.get('/pages/:id/automations', async (req, res) => {
  const r = await pool.query('SELECT id, name, trigger_keyword, flow_data FROM flows WHERE channel_id=$1 ORDER BY id DESC', [req.params.id]);
  res.json(r.rows);
});

router.post('/pages/:id/automations', async (req, res) => {
  const { keyword, reply } = req.body || {};
  if (!keyword?.trim() || !reply?.trim()) return res.status(400).json({ error: 'কীওয়ার্ড ও রিপ্লাই দিন' });
  const r = await pool.query(
    "INSERT INTO flows (channel_id, name, flow_data, trigger_type, trigger_keyword) VALUES ($1,$2,$3,'keyword',$4) RETURNING id",
    [req.params.id, keyword.trim(), JSON.stringify({ replyText: reply.trim() }), keyword.trim()]
  );
  res.status(201).json(r.rows[0]);
});

router.delete('/pages/automations/:flowId', async (req, res) => {
  await pool.query('DELETE FROM flows WHERE id=$1', [req.params.flowId]);
  res.json({ success: true });
});

module.exports = router;
