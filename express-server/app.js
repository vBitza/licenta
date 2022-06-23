// npm requires
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const sslRedirect = require('heroku-ssl-redirect');

// local requires
const routes = require('./routes');

// app config
const app = express();

// cors
const corsOptions = {
  origin: '*'
};

app.use(sslRedirect());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(morgan('dev'));
app.use(bodyParser.json({
  limit: '100mb'
}));

app.use(bodyParser.urlencoded({
  limit: '100mb', extended: true
}));

//server static html
app.use(express.static(path.join(__dirname, 'dist')));

app.use(cors(corsOptions));

routes(app);

module.exports = app;
