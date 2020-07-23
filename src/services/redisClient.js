const redis = require('redis');
const bluebird = require('bluebird');
const config = require('../config/cache');

bluebird.promisifyAll(redis.RedisClient.prototype);

const MODULE = 'services/RedisClient';
const logger = log.child({ module: MODULE });

let client;
logger.info('Creating redis client');
if (config.redis.apiKey) {
    client = redis.createClient(config.redis.port, config.redis.url, {
        auth_pass: config.redis.apiKey,
        tls: { servername: config.redis.url },
        prefix: config.redis.prefix
    });
} else {
    client = redis.createClient(config.redis.port, config.redis.url, {
        prefix: config.redis.prefix
    });
}
logger.info('Created redis client successfully');
client.on('connect', (e) => {
    if (e) {
        logger.warn(`Failed to connect redis: ${e}`);
    }
    logger.trace('Connected redis successfully');
});
client.on('error', (e) => {
    logger.error(`Failed to connect redis: ${e}`);
});

module.exports = {

    getClient: async function() {
        return client;
    },

};
