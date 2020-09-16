const logger = require('./logger');
const redisCache = require('./cache');
const webSocket = require('ws');
const gensysApi = require('../common/gensysApi');
const mediaManagement = require('../common/mediaManagement');

const ctrl = {
    initWebsocket: async function(openId, log = logger) {
        const _log = log.child({ module: MODULE, method: 'initWebsocket' });
        const data = await gensysApi.createConversation();
        await redisCache.hmSet(openId,'conversationId',data.id);
        await redisCache.hmSet(openId,'jwt',data.jwt);
        await redisCache.hmSet(openId,'eventStreamUri',data.eventStreamUri);
        await redisCache.hmSet(openId,'clientId',data.member.id);
        const ws =  new webSocket(data.eventStreamUri);
        await redisCache.hmSet(openId,'ws', JSON.stringify(ws));
        return ws;
    },

    messageHandle: async function(ws, openId, message) {
        await mediaManagement.sendText(message.Content);

        ws.onopen = async function () {
           await mediaManagement.sendText('正在为您连接客服，请稍后');
        };

        ws.onmessage = function (msg) {
        };

        ws.onclose = async function () {
            await mediaManagement.sendText('客服会话已结束，感谢您的使用');
            let conversationData = await redisCache.hmGet(openId)
            ws.close();
            await gensysApi.endConversation(conversationData.conversationId,conversationData.clientId,conversationData.jwt);
        };

        ws.onerror = async function (err) {
            await mediaManagement.sendText('客服会话出现错误，感谢您的使用');
            let conversationData = await redisCache.hmGet(openId)
            ws.close();
            await gensysApi.endConversation(conversationData.conversationId,conversationData.clientId,conversationData.jwt);
        };

    }

}


module.exports = ctrl;
