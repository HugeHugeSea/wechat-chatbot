const logger = require('./logger');
const { ObjectID } = require('mongodb');
const mongodb = require('./mongodb');
const moment = require('moment');
const config = _.getConfig('mongodb');

const MODULE = 'services/userAndDialog';
const USER_COLLECTION_NAME = config.collection.user;
const DIALOG_COLLECTION_NAME = config.collection.dialog;


const build = {
    buildUserFilter: function(query, specialConditions) {
        let conditions = _.isArray(specialConditions) ? specialConditions : [];

        if (_.isString(query._id)) {
            conditions.push({ _id: new ObjectID(query._id) });
        }

        if (_.isString(query.openId)) {
            conditions.push({ openId: query.openId });
        }

        if (_.isString(query.startDateTime)) {
            conditions.push({
                createdAt: mongodb.constructDateQuery('createdAt', 'gte'+query.startDateTime)
            });
        }

        if (_.isString(query.endDateTime)) {
            conditions.push({
                createdAt: mongodb.constructDateQuery('createdAt', 'lte'+query.endDateTime)
            });
        }

        return conditions.length ? { $and: conditions } : {};
    },

    buildDialogFilter: function(query, specialConditions) {
        let conditions = _.isArray(specialConditions) ? specialConditions : [];

        if (_.isString(query._id)) {
            conditions.push({ _id: new ObjectID(query._id) });
        }

        if (_.isString(query.openId)) {
            conditions.push({ openId: query.openId });
        }

        if (_.isString(query.sendType)) {
            conditions.push({ sendType: query.sendType });
        }

        if (_.isString(query.startDateTime)) {
            conditions.push({
                createdAt: mongodb.constructDateQuery('createdAt', 'gte'+query.startDateTime)
            });
        }

        if (_.isString(query.endDateTime)) {
            conditions.push({
                createdAt: mongodb.constructDateQuery('createdAt', 'lte'+query.endDateTime)
            });
        }

        return conditions.length ? { $and: conditions } : {};
    },
}

const base = {
    saveUser: async function(doc, log=logger) {
        const _log = log.child({ module: MODULE, method: 'saveUser' });
        _log.info('save user...');
        _log.debug('doc: %j', doc);

        try {
            const db = await mongodb.getDb(_log);
            const user = await db.collection(USER_COLLECTION_NAME).insertOne(doc);

            _log.info(`Created success: ${user}.`);
            return user;
        } catch (e) {
            _log.error('Failed to save user: ', e);
            throw e;
        }
    },

    saveDialog: async function(doc, log = logger){
        const _log = log.child({ module: MODULE, method: 'saveDialog' });
        _log.info('save saveDialog...');
        _log.debug('doc: %j', doc);

        try {
            const db = await mongodb.getDb(_log);
            const tag = await db.collection(DIALOG_COLLECTION_NAME).insertOne(doc);

            _log.info(`Created success: ${tag}.`);
            return tag;
        } catch (e) {
            _log.error('Failed to save dialog: ', e);
            throw e;
        }
    },

    getUser: async function(filter, options, log = logger) {
        const _log = log.child({ module: MODULE, method: 'getUser' });
        _log.info('Finding user...');
        _log.debug('filter: %j, options: %j', filter, options);

        try {
            const db = await mongodb.getDb(_log);
            const user = await db.collection(USER_COLLECTION_NAME)
                .find(filter, options)
                .toArray();

            _log.info(`Found ${user.length} user.`);
            return user;
        } catch (e) {
            _log.error('Failed to get user: ', e);
            throw e;
        }
    },

    getDialog: async function(filter, options, log = logger) {
        const _log = log.child({ module: MODULE, method: 'getDialog' });
        _log.info('Finding dialog...');
        _log.debug('filter: %j, options: %j', filter, options);

        try {
            const db = await mongodb.getDb(_log);
            const user = await db.collection(DIALOG_COLLECTION_NAME)
                .find(filter, options)
                .toArray();

            _log.info(`Found ${user.length} dialog.`);
            return user;
        } catch (e) {
            _log.error('Failed to get dialog: ', e);
            throw e;
        }
    },
}

const svc = {
    saveUser: async function(user, log=logger) {
        let doc = {
            openId: user.FromUserName,
            userName: user.ToUserName,
            createdAt: moment().toDate()
        };

        return await base.saveUser(doc, log);
    },

    saveClientMsg: async function(message, log=logger) {
        let doc = {
            openId: message.FromUserName,
            userName: message.ToUserName,
            sendType: 'client',
            message: message.Content,
            msgId: message.MsgId,
            msgType: message.MsgType,
            createdAt: moment().toDate()
        };

        return await base.saveDialog(doc, log);
    },

    saveWechatMsg: async function(message, log=logger) {
        let doc = {
            openId: message.FromUserName,
            userName: message.ToUserName,
            sendType: 'domain',
            action: message.action,
            intent: message.intent,
            intentDetectionConfidence: message.intentDetectionConfidence,
            languageCode: message.languageCode,
            parameters: message.parameters,
            fulfillmentMessages: message.fulfillmentMessages,
            message:message.fulfillmentText,
            createdAt: moment().toDate()
        };

        return await base.saveDialog(doc, log);
    },

    getUser: async function( query, log=logger) {
        let filter = build.buildUserFilter(query);
        let options = mongodb.parseOptions(query);
        return await base.getUser(filter, options, log);
    },

    getDialog: async function( query, log=logger) {
        let filter = build.buildDialogFilter(query);
        let options = mongodb.parseOptions(query);
        return await base.getDialog(filter, options, log);
    },

}

module.exports = svc;
