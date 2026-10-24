const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/subscribers/:channelId', chatController.getSubscribers);
router.get('/messages/:subscriberId', chatController.getMessages);
router.post('/send', chatController.sendMessage);

module.exports = router;
