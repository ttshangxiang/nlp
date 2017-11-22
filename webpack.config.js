'use strict';

var path = require('path');
var env = process.env.NODE_ENV;

if (env !== 'dev') {
  env = 'dist';
}
var config = require(path.join(__dirname, 'cfg/' + env));

module.exports = config;
