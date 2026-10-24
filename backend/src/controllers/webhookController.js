const botController = require('./botController');
const pool = require('../config/db');
const axios = require('axios');

exports.verifyWebhook = (req, res) => {
    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'my_custom_secret_token_123';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

exports.handleWebhookEvent = async (req, res) => {
    const body = req.body;
    if (body.object !== 'page') return res.sendStatus(404);
    res.status(200).send('EVENT_RECEIVED');

    for (const entry of body.entry || []) {
        try {
            const ch = await pool.query('SELECT id FROM channels WHERE platform_page_id = $1', [String(entry.id)]);
            if (!ch.rows[0]) { console.log('No channel for page', entry.id); continue; }
            for (const ev of entry.messaging || []) {
                const text = ev.message && ev.message.text;
                if ((ev.message && ev.message.is_echo) || !text) continue;
                console.log('Incoming message:', ev.sender.id, text);
                await botController.processIncomingMessage(ch.rows[0].id, ev.sender.id, text);
            }
        } catch (e) { console.error('Webhook error:', e.message); }
    }
};
