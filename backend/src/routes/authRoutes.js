const express = require('express');
const router = express.Router();

// ডেমো বা স্ট্যান্ডার্ড লগইন রাউট
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    res.json({
        success: true,
        message: 'Login successful',
        token: 'mock_jwt_token_12345',
        user: { name: 'Moslina', email: email || 'admin@flowbot.com' }
    });
});

// অফিশিয়াল গুগল অথেন্টিকেশন এন্ডপয়েন্ট (Google OAuth Callback Handler)
router.post('/google', (req, res) => {
    const { credential } = req.body;
    
    // এখানে গুগল টোকেন ভেরিফিকেশন লজিক কাজ করবে
    // সফলভাবে ভেরিফাই হওয়ার পর ইউজারের তথ্য রিটার্ন করা হবে
    res.json({
        success: true,
        message: 'Official Google Login Successful',
        token: 'google_verified_jwt_token',
        user: {
            name: 'Google User (Moslina)',
            email: 'moslina.user@gmail.com',
            avatar: 'https://lh3.googleusercontent.com/a/default-user'
        }
    });
});

module.exports = router;
