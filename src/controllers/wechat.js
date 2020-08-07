const Dialogflow = require('../services/dialogflow');
const wechatService = require('../services/wechat');

const dialogFlowConfig = _.getConfig('dialogflow');

const dialogflow = new Dialogflow(dialogFlowConfig.dialogflow);

const ctrl = {

    getDialogFlowMsg: async function(message, log) {
        const openId = message.FromUserName;
        const userName = message.ToUserName;
        const response = await dialogflow.detectIntent(openId, message);
        await wechatService.saveClientMsg(message, log);
        response.FromUserName = openId;
        response.ToUserName = userName;
        await wechatService.saveWechatMsg(response, log);
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

}

module.exports = ctrl;
