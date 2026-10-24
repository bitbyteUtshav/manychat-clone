const express = require('express');
const router = express.Router();
const flowController = require('../controllers/flowController');
router.get('/:channelId', flowController.getFlows);
router.post('/', flowController.createFlow);
module.exports = router;
