/* eslint-disable import/first */
process.env.LOG_OUTPUT_MODE = 'short';
process.env.API_RETRY_DELAY = '0';
const sinon = require('sinon');
const getLogger = require('@elastic.io/component-logger');
const { config } = require('dotenv');
const fs = require('fs');

if (fs.existsSync('.env')) {
  config();
}

exports.getContext = () => ({
  logger: getLogger(),
  emit: sinon.spy(),
});
