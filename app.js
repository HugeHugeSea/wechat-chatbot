const bodyParser = require('body-parser')
const express = require('express')
const helmet = require('helmet')
const noCache = require('nocache')
const cors = require('cors')
const routes = require('./src/routes');
const {setReqLogger } = require('./src/services/middlewares')
const mongodb = require('./src/services/mongodb');
const app = express()

const logger = log.child({ module: 'app' })

app.use(bodyParser.json({ type: [ 'application/json', 'application/*+json' ] }))
app.use(setReqLogger())
app.use(noCache())

function corsOptions(req, callback) {
  let _corsOptions;
  const origin = req.header('Origin');
  if (!origin) return callback(null, true);

  const whiteList = process.env.WHITE_LIST ? process.env.WHITE_LIST : '';
  const originIsWhitelisted = whiteList.split(',').indexOf(origin) !== -1;

  if (originIsWhitelisted) {
    _corsOptions = { origin: origin, credentials: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    _corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(originIsWhitelisted ? null : new Error('WARNING: CORS Origin Not Allowed'), _corsOptions); // callback expects two parameters: error and options
}
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

mongodb.initMongoDBClients();
app.use(routes);

process.on('uncaughtException', function(err) {
  logger.error('uncaught exception: ', err.stack);
});

module.exports = app

