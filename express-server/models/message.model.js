const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  conversation: {
	  type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
  	type: String,
  	required: true
  },
  authorId: {
  	type: mongoose.Schema.Types.ObjectId,
  	ref: 'User',
  	required: true
  },
  username: {
    type: String,
    required: true
  },
  timestamp: {
  	type: Number,
  	required: true
  },
  read: {
  	type: Boolean,
  	required: true
  }
});

module.exports = mongoose.model('Message', schema, 'messages');
