const wechatAPI = require('wechat-api');
const redisClient = require('../services/redisClient');

function getWXToken(callback) {
    redisClient.getClient().then(client => {
        client.get('accessToken', callback);
    })
}

function saveWXToken(token, callback) {
    redisClient.getClient().then(client => {
        client.set('accessToken',  JSON.stringify(token), callback);
    })

}

const wechatConfig = _.getConfig('wechat').wechat;
const api = new wechatAPI(wechatConfig.appID, wechatConfig.appSecret,getWXToken,saveWXToken);


module.exports = api;
