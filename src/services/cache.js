const redis = require('./redis');

let cache = redis;

module.exports = {

    hmGet: async function(key) {
        return await cache.hmGet(key);
    },

    hmSet: async function(key, mapKey, mapData) {
      return await  cache.hmSet(key, mapKey, mapData);
    },

    del: async function(key) {
        return await  cache.del(key);
    },

    expire: async function(key, expiryTime) {
        return await  cache.expire(key, expiryTime);
    },

    persist: async function(key) {
        return await  cache.persist(key);
    },

    exists: async function(key) {
        return await  cache.exists(key);
    }

}
