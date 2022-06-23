const _       = require('lodash');

const configDefaults = {
  appName: 'Chat',
  port: process.env.PORT || 1338,
  db: {
    name: 'chat',
    port: 27017,
    host: 'localhost',
  },
  constants: {
    //Add constants files here
  },
};

const config = {
  dev: _.merge(_.cloneDeep(configDefaults), {
    appName: 'Chat-dev',
  }),
  prod: _.merge(_.cloneDeep(configDefaults), {
    port: 8080,
    db: {
      name: 'Chat',
    },
  }),
  test: _.merge(_.cloneDeep(configDefaults), {
    appName: 'Chat-test',
    port: 2337,
    db: {
      name: 'Chat-test',
    },
  }),
};

module.exports = new Proxy(config, {
  get: (target, propertyName) => {
    let env = process.env.NODE_ENV || 'dev';

    if (!target[env]) {
      env = 'dev';
    }

    if (target[env].hasOwnProperty(propertyName)) {
      return target[env][propertyName];
    }

    return undefined;
  },
});
