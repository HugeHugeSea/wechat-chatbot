const api = require('./wechatConfig')
const logger = require('../services/logger');
const MODULE = 'common/wechatApi';

function uploadMaterialInfo(filepath, type) {
    return new Promise((resolve, reject) => {
        api.uploadMaterial(filepath, type,  (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result)
        });
    })
}

function uploadVideoInfo(filepath, description) {
    return new Promise((resolve, reject) => {
        api.uploadVideoMaterial(filepath, description,  (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result)
        });
    })
}

const ctrl = {
    //客服文本消息
    sendText:function (openId, text, log=logger) {
        const _log = log.child({ module: MODULE, method: 'sendText' });
        return new Promise((resolve, reject) => {
            api.sendText(openId, text,  (err, result) => {
                if (err) {
                    _log.error('failed send text: ', err);
                    reject(err);
                }
                resolve(result)
            });
        })
    },

    //获取用户信息
    getUserInfo:function (openId) {
        return new Promise((resolve, reject, log=logger) => {
            const _log = log.child({ module: MODULE, method: 'getUserInfo' });
            api.getUser(openId, (err, result) => {
                if (err) {
                    _log.error('failed get user: ', err);
                    reject(err);
                }
                resolve(result)
            });
        })
    },

    uploadMaterial: async function (filepath, type) {
        return await uploadMaterialInfo(filepath, type);
    },

    uploadVideo: async function (filepath, description) {
        return await uploadVideoInfo(filepath, description);
    }

}


module.exports = ctrl;
