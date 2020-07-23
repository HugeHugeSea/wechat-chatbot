const env = process.env

module.exports = {
    nodeCache: {
        nodeCacheEnable: env.NODECACHE_ENABLED === 'true' ? true : false,
        stdTTL: env.STDTTL ? parseInt(env.STDTTL) : 0,
        checkPeriod: env.CHECKPERIOD ? parseInt(env.CHECKPERIOD) : 600
    },
    redis: {
        url: env.REDIS_HOST,
        port: env.REDIS_PORT,
        expiryTime: env.REDIS_EXPIRY_TIME ? parseInt(env.REDIS_EXPIRY_TIME) : 900,
        apiKey: env.REDIS_API_KEY ? env.REDIS_API_KEY : null,
        prefix: env.REDIS_PREFIX ? env.REDIS_PREFIX : 'ROUTER:',
    }
}