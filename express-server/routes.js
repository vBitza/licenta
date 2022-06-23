const user = require('./routes/user.routes');
const conversation = require('./routes/conversation.routes');

module.exports = function (app) {
  app.use('/api/v1/user', user);
  app.use('/api/v1', conversation);
};
