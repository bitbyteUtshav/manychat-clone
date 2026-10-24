const pool = require('../config/db');

exports.getFlows = async (req, res) => {
    try {
        const channelId = req.params.channelId || 1;
        const flows = await pool.query('SELECT * FROM flows WHERE channel_id = $1 ORDER BY id DESC', [channelId]);
        res.json(flows.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createFlow = async (req, res) => {
    try {
        const { channel_id, name, trigger_keyword, reply_text } = req.body;
        const flowData = { replyText: reply_text };
        const newFlow = await pool.query(
            'INSERT INTO flows (channel_id, name, flow_data, trigger_type, trigger_keyword, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [channel_id || 1, name || 'Auto Reply', flowData, 'keyword', trigger_keyword, true]
        );
        res.json(newFlow.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
