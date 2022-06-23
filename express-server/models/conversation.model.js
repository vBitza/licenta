const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  members: {
    type: Array,
    required: true
  },
  messages: {
    type: Array,
    required: true
  }
});

module.exports = mongoose.model('Conversation', schema, 'conversations')
