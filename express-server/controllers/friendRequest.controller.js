const FriendRequest = require('../models/friendRequest.model');
const User = require('../models/user.model');
const debug = require('./debug.controller')('friend-request-controller');
const {
	createNewConversation
} = require('./conversation.controller');
const _ = require('lodash');

exports.createNewFriendRequest = createNewFriendRequest;
exports.checkIfFriendRequestExists = checkIfFriendRequestExists;
exports.retrieveFriendRequestsForUser = retrieveFriendRequestsForUser;
exports.readFriendRequest = readFriendRequest;
exports.acceptFriendRequest = acceptFriendRequest; 

function createNewFriendRequest(details) {
	FriendRequest.create(details).then((response) => {
		return response;
	}).catch((error) => {
		debug(error);
		return error;
	});
};

function retrieveFriendRequestsForUser(userId) {
	return FriendRequest.find({to: userId}).then((list) => {
		console.log(list);
		return list;
	}).catch((error) => {
		debug(error);
		return error;
	})
};

async function acceptFriendRequest(requestId, userId) {
	await User.findById(userId).then(async(user) => {
		let request = await getFriendRequestById(requestId);
	
		createNewConversation(request.from, request.to);
		
		user.friends.push(request.from);
		user.save();

		await User.findById(request.from).then((user) => {
			user.friends.push(request.to);
			user.save();
		})
	});
	
	return FriendRequest.findByIdAndDelete(requestId);
};

function addFriend(userId, friendId) {
	User.findById(userId).then((user) => {
		user.friends.push(friendId);
	}).catch((error) => {
		debug(error);
	});
};

function readFriendRequest(requestId) {
	return FriendRequest.findById(requestId).then((request) => {
		request.read = true;
		request.save();
	});
};

function checkIfFriendRequestExists (users) {
	return FriendRequest.find({
		to: {
			$in: users
		}, 
		from: {
			$in: users
		}
	}).then((response) => {
		debug(response)
		if (_.isEmpty(response)) {
			return true;
		} else {
			return false;
		}
	}).catch((error) => {
		debug(error);
	});
};

function getFriendRequestById(requestId) {
	return FriendRequest.findById(requestId).then((request) => {
		return request;
	}).catch((error) => {
		console.log(error);
		throw new Error(error);
	});
};
