const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  message: {
    type: String,
  },
  from: {
  	type: mongoose.Schema.Types.ObjectId,
  	ref: 'User',
  	required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

module.exports = mongoose.model('friendRequest', schema, 'friendRequests');
