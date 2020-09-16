const Dialogflow = require('../services/dialogflow');
const wechatService = require('../services/wechat');
const firebaseService = require('../services/firebaseService');
const redisCache = require('../services/cache');
const webSocket = require('ws');
const gensysApi = require('../common/gensysApi');
const talkToAgent = require('../services/talkToAgent');

const dialogFlowConfig = _.getConfig('dialogflow');

const dialogflow = new Dialogflow(dialogFlowConfig.dialogflow);

const ctrl = {

    getDialogFlowMsg: async function(message, log) {
        const openId = message.FromUserName;
        const userName = message.ToUserName;
        const response = await dialogflow.detectIntent(openId, message);
        await wechatService.saveClientMsg(message, log);
        await firebaseService.saveClientMessage(message, log);
        response.FromUserName = openId;
        response.ToUserName = userName;
        await wechatService.saveWechatMsg(response, log);
        await firebaseService.saveWechatMessage(response, log);
        return response.fulfillmentText;
    },

    getUserList: async function(req) {
        let { body } = req;
        return await wechatService.getUserList(body, req.log);
    },

    getWechatMsgByOpenId: async function(req) {
        let { body } = req;
        return await wechatService.getDialogByOpenId(body, req.log);
    },

    saveUser: async function(message, log) {
        const query = {openId: message.FromUserName};
        const isExistUser = await wechatService.isExistUser(query, log);
        if(!isExistUser) {
             await wechatService.saveUser(message, log);
        }
    },

    test: async function(message, log) {
        // const obj = {session:1,sex:'man'};
        // const user = JSON.stringify(obj);
        // await redisCache.hmSet('test','uesr',user);
        // const data = await redisCache.hmGet('test');
        // const userreal = JSON.parse(data.uesr);

        /*
         第一次和agent建立连接需要通过gnesys接口创建并把返回的值存入redis

         */
        const data = await gensysApi.createConversation();
        const ws =  new webSocket(data.eventStreamUri);
        await redisCache.hmSet('test','jwt',data.jwt);
        ws.on('message', async function (message) {
            //打印客户端监听的消息
            //console.log(message);
            let msg = JSON.parse(message);
            let obj = await redisCache.hmGet('test');
            if(msg.eventBody.hasOwnProperty('conversation') && msg.eventBody.hasOwnProperty('member')) {
                let data = await gensysApi.getMemberInfo(msg.eventBody.conversation.id,msg.eventBody.member.id, obj.jwt);
                console.log(data.data);
                if(data.data.role === 'AGENT' && data.data.state === 'DISCONNECTED') {
                    ws.close();
                }
            }
        });



    },

}

module.exports = ctrl;
