require('dotenv').config()
global.env = process.env
global.errors = require('restify-errors')

global.moment = require('moment-timezone')
moment.tz.setDefault('Etc/UTC')

global.Promise = require('bluebird')

global._ = require('./services/helper')
global.log = require('./services/logger')

global.cache = require('./services/cache')
