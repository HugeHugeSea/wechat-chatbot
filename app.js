const bodyParser = require('body-parser')
const express = require('express')
const helmet = require('helmet')
const noCache = require('nocache')
const cors = require('cors')
const routes = require('./src/routes');
const {setReqLogger } = require('./src/services/middlewares')
const app = express()

const logger = log.child({ module: 'app' })

app.use(bodyParser.json({ type: [ 'application/json', 'application/*+json' ] }))
app.use(setReqLogger())
app.use(noCache())

app.use(cors((req, callback) => {
  const opt = {
    origin: req.get('origin') || '*',
    allowedHeaders: [ 'Content-Type', 'Cache-Control', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers', 'apikey', 'trace_id'],
    allowMethods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT', 'OPTIONS'],
    credentials: true,
    preflightContinue: true
  }
  callback(null, opt)
}))

app.use(routes)

process.on('uncaughtException', function(err) {
  logger.error('uncaught exception: ', err.stack);
});

module.exports = app

