const User = require('../models/user.model');
const friendRequest = require('../models/friendRequest.model');
const Conversations = require('../models/conversation.model');
const Messages = require('../models/message.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('email-validator');
const hash = 'WebToLearn';
const express = require('express')
const debug = require('./debug.controller')('user-controller');
const {
	jsonResponse, 
	errorResponse, 
	succesResponse
} = require('./response.controller');
const {
	createNewFriendRequest,
	checkIfFriendRequestExists,
	retrieveFriendRequestsForUser,
	readFriendRequest,
	acceptFriendRequest
} = require('./friendRequest.controller');
const _ = require('lodash');
const moment = require('moment');

exports.login = login;
exports.register = register;
exports.getUserById = getUserById;
exports.isAuthenticated = isAuthenticated;
exports.routeGetFriendsList = routeGetFriendsList;
exports.routeAddFriend = routeAddFriend;
exports.routeGetFriendRequests = routeGetFriendRequests;
exports.routeReadFriendRequest = routeReadFriendRequest;
exports.routeAcceptFriendRequest = routeAcceptFriendRequest;
exports.routeDeleteFriendRequest = routeDeleteFriendRequest;
exports.routeGetFriendsList = routeGetFriendsList;
exports.changeUserStatus = changeUserStatus;
exports.getUserIdByToken = getUserIdByToken;

function register(req, res) {
	if (!validator.validate(req.body.email)) {
		return res.status(500).send('Invalid email format.');
	}

	let hashedPassword = bcrypt.hashSync(req.body.password, 8);

	User.findOne({email: req.body.email}, function(error, user){
		if (error) {
			errorResponse(res, new Error(error), 500);
		} else {
			if (user) {
				errorResponse(res, new Error('An user with this email already exists.'), 500);
			} else {
				User.create({
					username: req.body.username,
					password: hashedPassword,
					email: req.body.email,
					friends: [],
					active: false
				}, (error, user) => {
					if (error) {
						errorResponse(res, new Error(error), 500);
					} else {
						succesResponse(res, 'User succesfully registered.', 200);
					}
				});
			}
		}
	});
};

function login(req, res) {
	User.findOne({email: req.body.email}, ['username', 'email', 'password'], function(err, user) {
		if (err) {
			return res.status(500).send('Error');
		} else {
			if (!user) {
				errorResponse(res, new Error('Wrong credentials'), 403);					
			} else {
				let validatePassword = bcrypt.compareSync(req.body.password, user.password);
				
				if (!validatePassword) {
					errorResponse(res, new Error('Wrong credentials'), 403);					
				} else {
					let token = jwt.sign({id: user._id}, hash, {
						expiresIn: 86400
					});
					
					const userJson = user.toObject();
					delete userJson.password;

					jsonResponse(res, {...userJson, token}, 200);
				}
			}
		}
	});
};

function getUserById(req, res) {
	User.findOne({_id: req.body.userId}, function(err, user) {
		if (err) {
			console.log(err)
			return res.status(500).send('Internal server error');
		} else {
			res.status(200).send(user);
		}
	});
};

function isAuthenticated(req, res, next) {
	if (req.headers.token) {
		try {
			let decoded = jwt.verify(req.headers.token, hash);
			if (decoded) {
				User.findOne({_id: decoded.id}, function(err, user) {
					if (err) {
						return res.status(500).send('Internal server error');
					} else {
						req.body.userId = decoded.id;
						req.body.userMongoInstance = user; 
						return next();
					}
				});
			} else {
				res.status(403).send('Not authorized.');
			}
		} catch (e) {
			res.status(403).send('Not authorized.');
		}
	} else {
		errorResponse(res, new Error('Where\'s your token?'), 500);
	}
};

function getUserIdByToken(token) {
	try {
		let decoded = jwt.verify(token, hash);
		if (decoded) {
			return User.findById(decoded.id).then((user) => user._id);
		}
	} catch (error) {
		debug(error);
	}
}

async function routeAddFriend(req, res) {
	const userId = req.body.userId;
  const email = req.query.add;

  try {
  	const user = await getUserByEmail(email);
  	const sender = await User.findById(userId).then((user) => user);
  	const isValidRequest = await checkIfFriendRequestExists([userId, user._id]);

  	if (user.friends.indexOf(userId) !== -1) {
  		throw new Error(`You are already friends.`);
  	}

  	if (userId == user._id) {
  		throw new Error(`You can't friend request yourself.`);
  	}
  	
  	if (!isValidRequest) {
  		throw new Error(`A friend request has already been sent to this user.`);
  	}

  	const details = {
  		user: sender.username,
  		message: req.body.message,
  		from: userId,
  		to: user._id,
  		timestamp: moment().unix(),
  		read: false
  	};

  	let response = await createNewFriendRequest(details);
  	succesResponse(res, `Friend request succesfully sent.`, 200);
  } catch (error) {
  	debug(error);
  	errorResponse(res, new Error(error), 500);
  }
};

async function routeGetFriendRequests(req, res) {
	const userId = req.body.userId;

	try {
		const list = await retrieveFriendRequestsForUser(userId);

		const friendRequests = {
			list,
			unread: _.filter(list, {read: false}).length > 0 ? true : false
		};

		jsonResponse(res, friendRequests, 200);
	} catch (error) {
		debug(error);
	}
};

function getUserByEmail(email) {
	return User.findOne({email: email}).then((user) => {
		if (_.isNil(user)) {
			throw new Error(`User not found`);
		};

		return user;
	});
};

function routeReadFriendRequest(req, res) {
	const requestId = req.query.request;

	try {
		readFriendRequest(requestId);
		res.status(200).send();
	} catch (error) {
		debug(error);
	}
};

function routeAcceptFriendRequest(req, res) {
	const requestId = req.query.request;
	const userId = req.body.userId;

	try {
		acceptFriendRequest(requestId, userId).then((response) => {
			succesResponse(res, `Friend request succesfully accepted`, 200);
		});
	} catch (error) {
		debug(error);
	}
};

function routeDeleteFriendRequest(req, res) {
	const requestId = req.query.request;

	try {
		friendRequest.findByIdAndDelete(requestId).then((response) => {
			succesResponse(res, `Friend request succesfully deleted`, 200);
		}).catch((error) => {
			debug(error);
			throw new Error(error);
		})
	} catch (error) {
		errorResponse(res, new Error(error), 500);
	}
};

async function routeGetFriendsList(req, res) {
	const user = req.body.userMongoInstance;

	try {
		const friends = [];

		for (let friendId of user.friends) {
			await User.findById(friendId).then(async(friend) => {
				let conversationId = await Conversations.findOne({
					members: {
						$all: [user._id, friend._id]
					}
				}).then((conversation) => conversation._id);

				let unreadCount = await Messages.find({
					authorId: friendId,
					conversation: conversationId,
					read: false
				}).countDocuments();

				friends.push({
					username: friend.username,
					active: friend.active,
					conversationId,
					unreadCount
				});
			});
		}			

		jsonResponse(res, friends, 200);
	} catch (error) {
		debug(error);
	}
};

function changeUserStatus(userId) {
	User.findById(userId).then((user) => {
		user.active = !user.active;
		user.save();
	}).catch((error) => {
		debug(error);
	})
};
