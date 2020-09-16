const logger = require('./logger');
const MODULE = 'services/firebaseService';
const momentTimeZone = require("moment-timezone");
const firebase = require('./firebase');

const path = 'users/12345/history/0/script';
const ctrl = {
    saveClientMessage: async function(message, log = logger) {
        const _log = log.child({ module: MODULE, method: 'saveClientMessage' });
        const history = await firebase.getHistory(path, log);
        const now = moment();
        const nowStr = now.tz("Asia/Hong_Kong").format("HH:mm:ss");
        history.push({
            speaker: 1,
            text: message.Content,
            time: nowStr,
        });
        await firebase.updateHistory(path, history, log);
    },

    saveWechatMessage: async function(message, log = logger) {
        const _log = log.child({ module: MODULE, method: 'saveWechatMessage' });
        const history = await firebase.getHistory(path, log);
        const now = moment();
        const nowStr = now.tz("Asia/Hong_Kong").format("HH:mm:ss");
        history.push({
            speaker: 0,
            text: message.fulfillmentText,
            time: nowStr,
        });
        await firebase.updateHistory(path, history, log);
    }

}

module.exports = ctrl;
