const logger = require('./logger');
const redisCache = require('./cache');
const webSocket = require('ws');
const gensysApi = require('../common/gensysApi');
const wechatApi = require('../common/wechatApi');

const MODULE = 'services/talkToAgent';

const ctrl = {
    initWebsocket: async function(openId, userInfo, log = logger) {
        const _log = log.child({ module: MODULE, method: 'initWebsocket' });
        const data = await gensysApi.createConversation(userInfo, log);
        await redisCache.hmSet(openId,'conversationId',data.id);
        await redisCache.hmSet(openId,'jwt',data.jwt);
        await redisCache.hmSet(openId,'eventStreamUri',data.eventStreamUri);
        await redisCache.hmSet(openId,'clientId',data.member.id);
        const ws =  new webSocket(data.eventStreamUri);
        await this.messageHandle (ws, openId, log);

    },

    messageHandle: async function(ws, openId, log = logger) {

        ws.onopen = async function () {
           await wechatApi.sendText(openId, '正在为您连接客服，请稍后');
        };

        ws.onmessage = async function (message) {
            let msg = JSON.parse(message.data);
            let body = msg.eventBody;
            let conversationData = await redisCache.hmGet(openId);
            //对含有member的信息查询gennesys接口得到对应的角色身份以此来确认agent
            if (body.hasOwnProperty('conversation') && body.hasOwnProperty('member')) {
                let memberInfo = await gensysApi.getMemberInfo(body.conversation.id,body.member.id, conversationData.jwt);
                if(!conversationData.hasOwnProperty('agentId') && memberInfo.data.role === 'AGENT' && memberInfo.data.state === 'CONNECTED') {
                    await redisCache.hmSet(openId, 'agentId', memberInfo.data.id);
                    await wechatApi.sendText(openId, '人工客服为您服务', log);
                }
                if(memberInfo.data.role === 'AGENT' && memberInfo.data.state === 'DISCONNECTED') {
                    await redisCache.del(openId);
                    ws.close();
                }
            }

            //对于含有sender字段的信息判断是否为agent发送，若是则发给微信
            if (body.hasOwnProperty('conversation') && body.hasOwnProperty('sender')) {
                let isContainAgentId =  conversationData.hasOwnProperty('agentId');
                let isAgentId =  conversationData.agentId === body.sender.id;
                let isStandardBodyType = body.bodyType === 'standard';
                if(isContainAgentId && isAgentId && isStandardBodyType) {
                    await wechatApi.sendText(openId, body.body, log);
                }
            }

        }

        ws.onclose = async function () {
            await wechatApi.sendText(openId, '客服会话已结束，感谢您的使用');
            //ws.close();
            //let conversationData = await redisCache.hmGet(openId)
            //await gensysApi.endConversation(conversationData.conversationId,conversationData.clientId,conversationData.jwt);
        };

        ws.onerror = async function (err) {
            await wechatApi.sendText(openId, '客服会话出现错误，感谢您的使用');
            ws.close();
            // let conversationData = await redisCache.hmGet(openId)
            // await gensysApi.endConversation(conversationData.conversationId,conversationData.clientId,conversationData.jwt);
        };

    }

}


module.exports = ctrl;
