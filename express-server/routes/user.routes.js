const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const conversationController = require('../controllers/conversation.controller');

router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/friend', userController.isAuthenticated, userController.routeAddFriend);
router.get('/friend-requests', userController.isAuthenticated, userController.routeGetFriendRequests)
router.get('/friend-request/read', userController.routeReadFriendRequest);
router.get('/friend-request/accept', userController.isAuthenticated, userController.routeAcceptFriendRequest);
router.delete('/friend-request/delete', userController.routeDeleteFriendRequest);
router.get('/friends', userController.isAuthenticated, userController.routeGetFriendsList);

module.exports = router;
