const env = process.env;

const connection = {
  reconnectTries: Number.MAX_VALUE,
  useNewUrlParser: true,
  poolSize: parseInt(env.MONGODB_CONNECTION_POOL_SIZE || '5')
};

const svc = {
  url: env.MONGODB_URL_WECHAT,
  connection: connection,
  collection: {
    user: env.MONGODB_COLLECTION_NAME_USER || 'user',
    dialog: env.MONGODB_COLLECTION_NAME_DIALOG || 'dialog',
  }
};

module.exports = svc;
