const pool = require('../config/db');
const metaService = require('../services/metaService');

exports.getSubscribers = async (req, res) => {
    try {
        const channelId = req.params.channelId || 1;
        const subs = await pool.query('SELECT * FROM subscribers WHERE channel_id = $1 ORDER BY id DESC', [channelId]);
        res.json(subs.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { subscriberId } = req.params;
        const messages = await pool.query('SELECT * FROM messages WHERE subscriber_id = $1 ORDER BY created_at ASC', [subscriberId]);
        res.json(messages.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { channel_id, subscriber_id, message_text } = req.body;
        const subQuery = await pool.query('SELECT psid FROM subscribers WHERE id = $1', [subscriber_id]);
        if (subQuery.rows.length === 0) return res.status(404).json({ error: 'Subscriber not found' });

        const psid = subQuery.rows[0].psid;
        await metaService.sendMessage(channel_id || 1, psid, message_text);

        await pool.query(
            'INSERT INTO messages (channel_id, subscriber_id, sender_type, message_text, message_type) VALUES ($1, $2, $3, $4, $5)',
            [channel_id || 1, subscriber_id, 'admin', message_text, 'text']
        );

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
