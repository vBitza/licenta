const path     = require('path');
const mongoose = require('mongoose');

const config = require('../config');
const debug  = require('./debug.controller')('db-controller');

const retryTimeout = 5000;

exports.initConnection = initConnection;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

function initConnection() {
  let dbUrl = `mongodb+srv://express:express@cluster0-sdkay.mongodb.net/eztalk?retryWrites=true&w=majority`;
  let localDbUrl = `mongodb://${ config.db.host }:${ config.db.port }/${ config.db.name }`;

  return new Promise((resolve, reject) => {
    connectToMongo();

    function connectToMongo() {
      mongoose.connect(dbUrl, {useNewUrlParser: true}).then(() => {
        debug(`Connection to mongoDB on ${ dbUrl } established`);
        resolve();
      }).catch(error => {
        debug(`Error connecting to ${ localDbUrl }`);

        debug('%O', error);
        debug('Retrying connection in %s seconds', retryTimeout / 1000);

        setTimeout(connectToMongo, retryTimeout);
      });
    }
  });
}

exports.closeConnection = () => mongoose.disconnect().then(() => debug('Connection closed'));
