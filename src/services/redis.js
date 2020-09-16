const config = require('../config/cache');
const logger = require('./logger');
const redisClient = require('./redisClient');
const MODULE = 'services/redis';

module.exports = {

    /**
     * Get a value of specific session in the data.
     * @param {String} session
     */
    hmGet: async function(key) {
        const _log = logger.child({ module: MODULE, method: 'get' });
        return new Promise((async (resolve, reject) => {
            try {
                let client = await redisClient.getClient();
                client.hgetall(key, function(err, reply) {
                    _log.trace('Retrieve data from redis (key: %j, reply: %j)', key, reply);
                    if(reply && reply) {
                        resolve(reply);
                    }else{
                        if(!err) {
                            resolve(null);
                        }else{
                            _log.error(`Failed to retrieve data from redis: ${err}`);
                            reject(err);
                        }
                    }
                });
            }catch(e) {
                _log.error(`Failed to retrieve data from redis: ${e}`);
            }
        }));
    },


    hmSet(key, mapKey, mapData) {
        const _log = logger.child({ module: MODULE, method: 'set' });
        return new Promise((async (resolve, reject) => {
            try {
                let client = await redisClient.getClient();
                _log.trace('Storing data to redis (key: %j, mapKey: %j, mapData: %j)', key, mapKey,mapData);
                client.hmset(key, mapKey, mapData, (err, reply) => {
                    if(err) {
                        _log.error(`Failed to store data to redis: ${err}`);
                        reject(err);
                    }
                    resolve(reply);
                });
            }catch (e) {
                _log.error(`Failed to store data to redis: ${e}`);
            }

        }));
    },

    del(key) {
        const _log = logger.child({ module: MODULE, method: 'del' });
        return new Promise((async (resolve, reject) => {
            try {
                let client = await redisClient.getClient();
                _log.trace('delete data to redis (key: %j)', key);
                client.del(key, (err, reply) => {
                    if(err) {
                        _log.error(`Failed to delete data to redis: ${err}`);
                        reject(err);
                    }
                    resolve(reply);
                })
            }catch (e) {
                _log.error(`Failed to delete data to redis: ${e}`);
            }

        }));
    },

    expire(key, expiryTime) {
        const _log = logger.child({ module: MODULE, method: 'expire' });
        return new Promise((async (resolve, reject) => {
           try {
               let client = await redisClient.getClient();
               _log.trace('set expire time to redis (key: %j)', key);
               client.expire(key, expiryTime, (err, reply) => {
                   if(err) {
                       _log.error(`Failed to set expire time to redis: ${err}`);
                       reject(err);
                   }
                   resolve(reply);
               });
           }catch (e) {
               _log.error(`Failed to set expire time to redis: ${e}`);
           }
        }));
    },

    persist(key) {
        const _log = logger.child({ module: MODULE, method: 'persist' });
        return new Promise((async (resolve, reject) => {
            try {
                let client = await redisClient.getClient();
                _log.trace('persist time to redis (key: %j)', key);
                client.persist(key, (err, reply) => {
                    if(err) {
                        _log.error(`Failed to persist time to redis: ${err}`);
                        reject(err);
                    }
                    resolve(reply);
                });
            }catch (e) {
                _log.error(`Failed to persist time to redis: ${e}`);
            }
        }));
    },

    exists(key) {
        const _log = logger.child({ module: MODULE, method: 'exists' });
        return new Promise((async (resolve, reject) => {
            try {
                let client = await redisClient.getClient();
                _log.trace('query whether key exists (key: %j)', key);
                client.persist(key, (err, reply) => {
                    if(err) {
                        _log.error(`Failed query whether key exists: ${err}`);
                        reject(err);
                    }
                    resolve(reply);
                });
            }catch (e) {
                _log.error(`Failed query whether key exists: ${e}`);
            }
        }));
    }

}
