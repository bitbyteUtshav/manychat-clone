const pool = require('../config/db');
const metaService = require('../services/metaService');

exports.processIncomingMessage = async (channelId, senderPsid, messageText) => {
    try {
        let subscriberQuery = await pool.query('SELECT * FROM subscribers WHERE channel_id = $1 AND psid = $2', [channelId, senderPsid]);
        let subscriberId;

        if (subscriberQuery.rows.length === 0) {
            const newSub = await pool.query(
                'INSERT INTO subscribers (channel_id, psid, first_name, status) VALUES ($1, $2, $3, $4) RETURNING id',
                [channelId, senderPsid, 'User', 'active']
            );
            subscriberId = newSub.rows[0].id;
        } else {
            subscriberId = subscriberQuery.rows[0].id;
        }

        if (subscriberId) {
            await pool.query(
                'INSERT INTO messages (channel_id, subscriber_id, sender_type, message_text, message_type) VALUES ($1, $2, $3, $4, $5)',
                [channelId, subscriberId, 'subscriber', messageText, 'text']
            );
        }

        const flowsQuery = await pool.query(
            'SELECT * FROM flows WHERE channel_id = $1 AND is_active = TRUE AND LOWER(trigger_keyword) = LOWER($2)',
            [channelId, messageText.trim()]
        );

        let replyText = "ধন্যবাদ! আপনার মেসেজটি আমরা পেয়েছি। আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবে।";

        if (flowsQuery.rows.length > 0) {
            const flow = flowsQuery.rows[0];
            if (flow.flow_data && flow.flow_data.replyText) {
                replyText = flow.flow_data.replyText;
            }
        }

        await metaService.sendMessage(channelId, senderPsid, replyText);

        if (subscriberId) {
            await pool.query(
                'INSERT INTO messages (channel_id, subscriber_id, sender_type, message_text, message_type) VALUES ($1, $2, $3, $4, $5)',
                [channelId, subscriberId, 'bot', replyText, 'text']
            );
        }

    } catch (error) {
        console.error('Error processing bot message:', error);
    }
};
