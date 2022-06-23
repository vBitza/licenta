// npm requires
const http  = require('http');
const debug = require('./controllers/debug.controller')('server');
const services = require('./external-services.js');

// local requires
const dbController     = require('./controllers/db.controller');
const socketController = require('./controllers/socket.controller');
const app              = require('./app.js');
const config           = require('./config');
const port             = process.env.PORT || config.port;
const User = require('./models/user.model');

const server = http.Server(app);

debug('Starting server.');

dbController.initConnection()
.then(() => {
	return User.find({}).then((users) => {
		for (let user of users) {
			user.active = false;
			user.save();
		}
	});
}).then(socketController.init.bind(null, server))
.then(() => {
  server.listen(port, function () {
    debug('Listening on port: %d', port);
  });
})
.catch(error => {
  debug('App crashed on init');
});
