const logger = require('./logger');
const userAndDialogSvc = require('./userAndDialog');

const MODULE = 'services/wechat.api';

const svc = {
    saveUser: async function(user, log = logger) {
        const _log = log.child({ module: MODULE, method: 'saveUser' });
        await userAndDialogSvc.saveUser(user, _log);
        return {messages:'success'};
    },

    saveClientMsg: async function(message, log = logger) {
        const _log = log.child({ module: MODULE, method: 'saveCientMsg' });
        await userAndDialogSvc.saveClientMsg(message, _log);
        return {messages:'success'};
    },

    saveWechatMsg: async function(message, log = logger) {
        const _log = log.child({ module: MODULE, method: 'saveWechatMsg' });
        await userAndDialogSvc.saveWechatMsg(message, _log);
        return {messages:'success'};
    },

    getUserList: async function(query, log = logger) {
        const _log = log.child({ module: MODULE, method: 'getUserList' });
        const userList = await userAndDialogSvc.getUser(query, _log);
        if(userList.length === 0) {
            return {docs: [], total: 0};
        }
        let result = [];
        for (let user of userList) {
            result.push({
                openId:_.get(user,'openId'),
                userName: _.get(user,'userName'),
                Date: moment(_.get(user,'createdAt')).format('DD MMMM YYYY'),
                Time: moment(_.get(user,'createdAt')).format('HH:mm')
            });
        }

        return {docs: result, total: userList.length};
    },

    getDialogByOpenId: async function(query, log = logger) {
        const _log = log.child({ module: MODULE, method: 'getDialogList' });
        return await userAndDialogSvc.getDialog(query, _log);
    },

    isExistUser: async function(query, log = logger) {
        const _log = log.child({ module: MODULE, method: 'isExistUser' });
        const userList = await userAndDialogSvc.getUser(query, _log);
        if(userList.length > 0) {
            return true;
        }
        return false;
    }

}

module.exports = svc;
