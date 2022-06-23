const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const debug = require('./debug.controller')('conversation-controller');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const {
	jsonResponse, 
	errorResponse, 
	succesResponse
} = require('./response.controller');

exports.createNewConversation = createNewConversation;
exports.saveMessage = saveMessage;
exports.routeGetConversationMessages = routeGetConversationMessages;
exports.routeReadConversationMessages = routeReadConversationMessages;

function createNewConversation(to, from) {
	Conversation.create({
		members: [to, from],
		messages: []
	}).then((response) => {
		return response;
	}).catch((error) => {
		debug(error);
		return error;
	});
};

function saveMessage(data) {
	Message.create({
		conversation: mongoose.Types.ObjectId(data.conversationId),
		message: data.message,
		type: data.type,
		username: data.username,
		authorId: mongoose.Types.ObjectId(data.authorId),
		timestamp: moment().valueOf(),
		read: false
	}).then((response) => {

	}).catch((error) => {
		debug(error);
	})
};

async function routeGetConversationMessages(req, res) {
	const conversationId = req.query.conversationId;
	const page = req.query.page ? parseInt(req.query.page) : 1;
	const limit = 50;

	try {
		let messages = await Message.find({
			conversation: conversationId
		}).sort({timestamp: -1}).skip((page-1) * limit).limit(limit).lean().then((response) => response);

		messages = messages.map((message) => {
			return {
				...message,
				timestamp: moment(message.timestamp).format('DD/MM/YY hh:mm:ss')
			}
		});

		let currentUser = null;
		let groupedMessages = [];
		var index = -1;
		while (messages.length) {
			let message = messages.splice(-1,1).pop();

			if (currentUser === message.username) {
				groupedMessages[index].messages.push(message);
			} else {
				index++;
				currentUser = message.username;
				groupedMessages.push({
					type: message.type,
					timestamp: message.timestamp,
					username: message.username, 
					messages: [message],
				});
			}
		};

		jsonResponse(res, groupedMessages, 200);

	} catch (error) {
		debug(error);
	}
};

function routeReadConversationMessages(req, res) {
	const conversationId = mongoose.Types.ObjectId(req.query.conversationId);
	const userId = mongoose.Types.ObjectId(req.query.userId);

	Message.find({
		authorId: {
			$ne: userId
		},
		conversation: conversationId
	}).then((response) => {
		for (let i = 0; i < response.length; i++) {
			response[i].read = true;
			response[i].save();
		}

		succesResponse(res, 'OK', 200);
	});
};