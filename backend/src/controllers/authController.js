const axios = require('axios');

exports.handleFacebookCallback = async (req, res) => {
    const { code } = req.query;
    const CLIENT_ID = process.env.FACEBOOK_APP_ID;
    const CLIENT_SECRET = process.env.FACEBOOK_APP_SECRET;
    
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const REDIRECT_URI = `${protocol}://${host}/api/auth/facebook/callback`;

    try {
        const tokenRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: code
            }
        });

        const userAccessToken = tokenRes.data.access_token;

        const pagesRes = await axios.get(`https://graph.facebook.com/v18.0/me/accounts`, {
            params: {
                access_token: userAccessToken
            }
        });

        const realPages = encodeURIComponent(JSON.stringify(pagesRes.data.data));
        
        // ব্যাকএন্ড পোর্ট (5000) থেকে ফ্রন্টএন্ড পোর্ট (5173)-এ রিডাইরেক্ট করা
        const frontendHost = host.replace('-5000.', '-5173.');
        res.redirect(`${protocol}://${frontendHost}?pages=${realPages}&token=${userAccessToken}`);
    } catch (error) {
        console.error('Error connecting Facebook:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Failed to connect Facebook pages' });
    }
};
