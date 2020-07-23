const pino = require('pino')

module.exports = pino(_.getConfig('logger'))
