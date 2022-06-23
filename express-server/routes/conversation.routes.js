const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');

router.get('/conversation', conversationController.routeGetConversationMessages);
router.get('/readConversation', conversationController.routeReadConversationMessages);

module.exports = router;
