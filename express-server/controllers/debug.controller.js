let config = require('../config');
let debug  = require('debug');

module.exports = debuggerName => debug(`${ config.appName }:${ debuggerName }`);
