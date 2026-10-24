const axios = require('axios');
const pool = require('../config/db');

exports.sendMessage = async (channelId, psid, messageText) => {
    try {
        const channelRes = await pool.query('SELECT access_token FROM channels WHERE id = $1', [channelId]);
        const accessToken = channelRes.rows[0]?.access_token || process.env.PAGE_ACCESS_TOKEN;

        if (!accessToken) {
            console.log('Page Access Token not found, skipping external send.');
            return;
        }

        await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`, {
            recipient: { id: psid },
            message: { text: messageText }
        });
    } catch (err) {
        console.error('Error sending message to Meta:', err.response?.data || err.message);
    }
};
