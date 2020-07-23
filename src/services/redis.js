const config = require('../config/cache');
const logger = require('./logger');
const redisClient = require('./redisClient');
const MODULE = 'services/redis';

module.exports = {

    /**
     * Get a value of specific session in the data.
     * @param {String} session
     */
    get: async function(session) {
        const _log = logger.child({ module: MODULE, method: 'get' });
        return new Promise((async (resolve, reject) => {
            try {
                let client = await redisClient.getClient();
                client.hgetall(session, function(err, reply) {
                    _log.trace('Retrieve data from redis (session: %j, reply: %j)', session, reply);
                    if(reply && reply.data) {
                        resolve(reply.data);
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
                reject(e);
            }
        }))
    },

    /**
     * Set a value of specific session in the data.
     * @param {String} session
     * @param {Object} data
     */
    set(session, data) {
        const _log = logger.child({ module: MODULE, method: 'set' });
        redisClient.getClient().then(client => {
            _log.trace('Storing data to redis (session: %j, data: %j)', session, data);
            client.hmset(session, "data", data, (err, reply) => {
                if(err) {
                    _log.error(`Failed to store data to redis: ${err}`);
                }
            });
            client.expire(session, config.redis.expiryTime, (err, reply) => {
                if(err) {
                    _log.error(`Failed to set expire time to redis: ${err}`);
                }
            });
        }).catch(reason => {
            _log.error(`Failed to store data to redis: ${reason}`);
        })
    }

}
