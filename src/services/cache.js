const redis = require('./redis');

let cache = redis;

module.exports = {
    /**
     * Get a value of specific session in the data.
     * @param {String} session
     */
    get: async function(session) {
        return await cache.get(session);
    },

    /**
     * Set a value of specific session in the data.
     * @param {String} session
     * @param {Object} data
     */
    set(session, data) {
        cache.set(session, data);
    }

}
