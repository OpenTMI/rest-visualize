// native modules
const util = require('util');
const {spawn} = require('child_process');
const cluster = require('cluster');

// 3rd party modules
const express = require('express');
const winston = require('winston');
const Transport = require('winston-transport');
const superagent = require('superagent');
const _ = require('lodash');
const {Addon} = require('opentmi-addon');
// application modules
const logger = require('../../tools/logger');

class BogeyLogger extends Transport {
  constructor(...args) {
    super(...args);
    this.name = 'BogeyLogger';
    this.level = 'info';
  }
  log({metadata}, callback = () => {}) {
    const statusCode = _.get(metadata, 'res.statusCode');
    const ip = _.get(metadata, 'req.headers.host');
    const uri = _.get(metadata, 'req.url');
    if(statusCode && ip && uri) {
      const data = {statusCode, ip, uri};
      superagent.post(`http://localhost:8008/log`)
  	        .send(data)
  	        .end();
    }
    callback(null, true);
  }
}

class AddonRestVisualize extends Addon {
  constructor(...args) {
    super(...args);
    this._bogeyLogger = undefined;
    this.router = express.Router();
    if (!cluster.isMaster) {
      throw new Error('Does not support cluster mode');
    }
  }
  register() {
    logger.warn('registering');
    this._bogeyLogger = new BogeyLogger({format: winston.format.json()});
    this.logger.logger.add(this._bogeyLogger);
    this._bogey = spawn('bogey');
    this._bogey.once('exit', (code) => {
      logger.silly('bogey exited');
    });
  }
  unregister() {
    logger.warn('unregistering');
    this._bogey.kill();
  }
}


module.exports = AddonRestVisualize;
