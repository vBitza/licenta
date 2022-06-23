const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  friends: {
    type: Array,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('User', schema, 'users')
