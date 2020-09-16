const admin = require("firebase-admin");
const logger = require('./logger');
const MODULE = 'services/firebase';

const firebaseConfig = _.getConfig('firebase').firebase;
const serviceAccount = JSON.parse(firebaseConfig.privateKey);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: firebaseConfig.databaseURL
});
const ctrl = {
    getHistory: async function(path, log = logger) {
        const _log = log.child({ module: MODULE, method: 'getHistory' });
        _log.info('get history...');
        _log.debug('path: %j', path);
       try {
           const ref = admin
               .database()
               .ref(path);
           const snap = await ref.once("value");
           const result = snap.val();
           return result;
       }catch (e) {
           _log.error('Failed to get history: ', e);
           throw e;
       }
    },

    updateHistory: async function(path, data, log = logger) {
        const _log = log.child({ module: MODULE, method: 'updateHistory' });
        _log.info('update history...');
        _log.debug('path: %j, options: %j', path, data);
       try {
           const ref = admin
               .database()
               .ref(path);
          return  await ref.set(data);
       }catch (e) {
           _log.error('Failed to update history: ', e);
           throw e;
       }
    },



}

module.exports = ctrl;
