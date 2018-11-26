const bunyan = require('bunyan');
const log = bunyan.createLogger({
  name: 'my-logger',
  serializers: bunyan.stdSerializers
})

module.exports = log;
