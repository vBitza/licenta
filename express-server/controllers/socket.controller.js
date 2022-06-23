const debugController = require('./debug.controller');
const socketIO        = require('socket.io');
const _               = require('lodash');
const config          = require('../config');
const {
  changeUserStatus,
  getUserIdByToken
} = require('./user.controller');
const {
  saveMessage
} = require('./conversation.controller');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');

let io;

exports.init = init;
exports.io = io;

function init(server) {
  const debug = debugController('Socket.IO');
  return new Promise((resolve, reject) => {
    if (io) {
      debug('Socket IO already initialized.');
      return reject(new Error('Socket IO already initialized.'));
    }

    io = socketIO(server);
    io.on('connection', async (socket) => {
    	if (socket.handshake.query.token) {
	      const userId = await getUserIdByToken(socket.handshake.query.token);
	      // socket.id = userId;
	      debug(`Connected ${userId}`);

	      socket.join(userId, () => {
		      changeUserStatus(userId);

		      socket.on('SEND_MESSAGE', (message) => {
		      	console.log(message)
		        Conversation.findById(message.conversationId).lean().then((response) => {
		        	let users = JSON.parse(JSON.stringify(response.members));
		        	let receiverId = _.without(users, message.authorId).pop();

		        	User.findById(receiverId).then((user) => {
		        		if (user.active) {
					        io.sockets.in(receiverId).emit('MESSAGE', message)
		        		}
		        	})
		        });

		        saveMessage(message);
		      });

		      socket.on('CALL_FRIEND', (callInfo) => {
						Conversation.findById(callInfo.conversationId).lean().then((response) => {
		        	let users = JSON.parse(JSON.stringify(response.members));
		        	let receiverId = _.without(users, callInfo.authorId).pop();

		        	User.findById(receiverId).then((user) => {
		        		if (user.active) {
					        io.sockets.in(receiverId).emit('CALL_INCOMING', callInfo)
		        		}
		        	})
		        });
		      });

		      socket.on('ANSWER_CALL', (callInfo) => {
		      	socket.join(callInfo.conversationId, () => {
		      		console.log('ANSWER CALL');
		      		io.sockets.in(callInfo.conversationId).emit('ANSWER_CALL', callInfo.capabilities);
		      	});
		      });

		      socket.on('DECLINE_CALL', (callInfo) => {
		      	console.log("DECLINED CALL")
		      	socket.join(callInfo.conversationId, () => {
		      		io.sockets.in(callInfo.conversationId).emit('DECLINE_CALL');
		      	});
		      });

	      });
	
	      socket.on('disconnect', () => {
	        changeUserStatus(userId);
	      });
    	} else {
    		let conversationId = socket.handshake.query.conversationId;

	      socket.join(conversationId, () => {
		      socket.on('privateMessagePCSignaling', (call) => {
		      	console.log(call)
		      	io.sockets.in(conversationId).emit('privateMessagePCSignaling', call);
		      });

		      socket.on('REMOTE_VIDEO_STOP', (callInfo) => {
		      	console.log("REMOTE_VIDEO_STOP")
	      		socket.broadcast.to(callInfo.conversationId).emit('REMOTE_VIDEO_STOP');
		      });

		      socket.on('REMOTE_VIDEO_START', (callInfo) => {
		      	console.log("REMOTE_VIDEO_START")
	      		socket.broadcast.to(callInfo.conversationId).emit('REMOTE_VIDEO_START');
		      });

		      socket.on('REMOTE_VIDEO_ENDED', (callInfo) => {
		      	console.log("REMOTE_VIDEO_ENDED")
	      		socket.broadcast.to(callInfo.conversationId).emit('REMOTE_VIDEO_ENDED');
		      });

		      socket.on('REMOTE_AUDIO_STATUS_CHANGE', (callInfo) => {
		      	console.log("REMOTE_VIDEO_ENDED")
	      		socket.broadcast.to(callInfo.conversationId).emit('REMOTE_AUDIO_STATUS_CHANGE');
		      });
	     	});
    	}
    });

    debug('Init Done');
    resolve();
  });
};

