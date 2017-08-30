// native modules
const util = require('util');
const spawn = require('child_process').spawn;
// 3rd party modules
const express = require('express');
const winston = require('winston');
const superagent = require('superagent');
const _ = require('lodash');
// application modules
const logger = require('../../tools/logger');

class BogeyLogger extends winston.Transport {
  constructor(options) {
    super({});
    this.name = 'BogeyLogger';
    this.level = 'info';
  }
  log(level, msg, meta, callback) {
    const statusCode = _.get(meta, 'res.statusCode');
    const ip = _.get(meta, 'req.headers.host');
    const uri = _.get(meta, 'req.url');
    if(statusCode && ip && uri) {
      const data = {statusCode, ip, uri};
      superagent.post(`http://localhost:8008/log`)
  	        .send(data)
  	        .end();
    }
    callback(null, true);
  }
}
winston.transports.BogeyLogger = BogeyLogger;

class AddonCore {
  constructor(app, server, io) {
    this.router = express.Router();
  }
  register() {
    logger.warn('registering');
    winston.add(winston.transports.BogeyLogger)
    this._bogey = spawn('bogey');
    this._bogey.on('exit', (code) => {
      logger.silly('bogey exited');
    });
  }
  unregister() {
    logger.warn('unregistering');
    this._bogey.kill();
  }
}


module.exports = AddonCore;
