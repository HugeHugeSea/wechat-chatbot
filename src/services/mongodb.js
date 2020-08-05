const { MongoClient } = require('mongodb');
const config = _.getConfig('mongodb');
const moment = require('moment');
const logger = log;

const MODULE = 'services/mongodb';

let connection = {};
let activeConnections = {};

async function createIndex(_client) {
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  /** Create Index for the dialogs collection in mongoDB, which is depend on what domainBot you are using **/
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  //1. Example get chat-framework-d1 Database domainBot name base on the current URL
  const db = _client.db();
  //2. then Get the dialogs_collection DIALOGS_COLLECTION_NAME = config.collection.dialogs = 'dialogs' in DB
  const dialogs_collection = db.collection('dialogs');
  //3. dialogs_collection create index
  const index = await dialogs_collection.createIndex({ "messages.text.payload": "text" });
  log.trace('Create Index successfully', index);
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

async function _connect(log) {
  const dbConfig = config;
  let client = activeConnections[dbConfig.url];
  if (client != null) {
    return client;
  }

  log.info('[Mongodb] Start connecting to mongodb');
  client = await MongoClient.connect(dbConfig.url, dbConfig.connection);
  activeConnections[dbConfig.url] = client;
  connection.client = client;
  log.info('[Mongodb] Connect to mongodb %s successfully');

  return connection.client;
}

const svc = {
  constructDateQuery(name, target) {
    const matches = target.match(/^(eq|gte|gt|lte|lt)?:?(.*)/);

    const operator = '$' + (matches[1] || 'eq');
    const datetime = moment(matches[2]);

    if (!datetime.isValid()) {
      throw new errors.BadRequestError(`Invalid "${name}" query: unkown date-time format: ${matches[2]}`);
    }

    return {
      [operator]: datetime.toDate()
    };
  },

  parseSkipOption(query) {
    return _.isString(query.skip) ? Number(query.skip) : (Number(query.skip) ? query.skip : 0);
  },

  parseLimitOption(query) {
    return _.isString(query.limit) ? Number(query.limit) : (Number(query.limit) ? query.limit : 20);
  },

  parseSortOption(query) {
    let sort = _.isString(query.sort) ? query.sort : { createdAt: -1 };
    if (_.isString(sort)) {
      const pairs = sort.split(';');
      sort = {};
      for(let item of pairs){
        const pair = item.trim().split(':');
        const field = pair[0].trim();
        sort[field] = pair[1].trim() === 'desc' ? -1 : 1;
      }
    }

    return sort;
  },

  parseSearchConstraints(query) {
    let skip = this.parseSkipOption(query);
    let limit = this.parseLimitOption(query);
    let sort = this.parseSortOption(query);

    return { skip, limit, sort };
  },

  parseOptions(query, isPagination) {
    if(isPagination) {
      return this.parseSearchConstraints(query);
    }
    let options = {};
    if(query.sort) {
      options.sort = this.parseSortOption(query);
    }
    if(query.skip) {
      options.skip = this.parseSkipOption(query);
    }
    if(query.limit) {
      options.limit = this.parseLimitOption(query);
    }

    return options;
  },

  initMongoDBClients: async function(log=logger) {
    const _log = log.child({ module: MODULE, method: 'initMongoDBClients' });
    _log.info('[Mongodb] Start to init mongodb clients...');

    await _connect(_log);
  },

  getClient: async function(log) {
    if (connection && connection.client) {
      return connection.client;
    }
    return await _connect(log);
  },

  getDb: async function(domainBot, log) {
    const _client = await svc.getClient(log);
    ////
    await createIndex(_client);
    ////
    return _client.db();
  },
};

module.exports = svc;
