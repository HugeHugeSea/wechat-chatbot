const router = require('express').Router();
const wechat = require('wechat');
const wechatApi = require('../../common/wechatApi');
const Dialogflow = require('../../services/dialogflow');
const firebase = require("firebase");
const admin = require("firebase-admin");
const moment = require("moment-timezone");
const redisCache = require('../../services/cache');


const wechatConfig = _.getConfig('wechat').wechat;
const dialogFlowConfig = _.getConfig('dialogflow');




const dialogflow = new Dialogflow(dialogFlowConfig.dialogflow);



const {
     saveUser,
    getDialogFlowMsg,
    getUserList,
    getWechatMsgByOpenId,
    initAgentConversation,
    clientSendMsg,
    test,
} = require('../../controllers/wechat');

const {
    reply,
} = require('../../services/middlewares');

router.get('/upload',
    async function (req, res, next) {

        const filepath = 'C:/javadev/upload/test/sea.jpg';
        const type = 'image';
        const uploadResult = await test.uploadMaterial(filepath, type).catch(e => {
            console.log(e);
        });
        res.send(uploadResult);
    }
)

router.get('/uploadVideo',
    async function (req, res, next) {

        const filepath = 'C:/javadev/upload/test/videoTest.mp4';
        const description = {
            'title':"test",
            'introduction':'test'
        };
        const uploadResult = await test.uploadVideo(filepath, description).catch(e => {
            console.log(e);
        });
        res.send(uploadResult);
    }
)

router.post('/getUserList',
    reply(getUserList)
);

router.post('/getWechatMsgByOpenId',
    reply(getWechatMsgByOpenId)
);

router.post('/testApi',
    async function(req, res, next) {
        // const message = req.body;
        // const response = await saveUser(message, req.log);
        // res.json(response);
        //await test();
        const a = await wechatApi.getUserInfo('oFCMct1iw56TlW7bAgC7BrdN3kPE');
        res.send(a);
    }
)

router.use('/', wechat(wechatConfig, async function(req, res, next) {
    console.log(req.weixin);
    const message = req.weixin;

    //文本
    if (message.MsgType === 'text') {
        /*
        根据redis判断openId是否存在且是否触发关键字，存在则已经和agent建立聊天走agent流程
         */
        const isOpenIdExist = await redisCache.exists(message.FromUserName);
        if(message.Content === 'live agent' && !isOpenIdExist) {
            //初始化genesys agent聊天
           await initAgentConversation(message, req.log);
            res.reply('');
        }else if(isOpenIdExist) {
            //发送message
            await clientSendMsg(message, req.log);
            res.reply('');
        }else{
            const response = await  getDialogFlowMsg(message, req.log);
            res.reply(response);
        }
    } else if(message.MsgType === 'voice') {
        //wechatApi.sendText('hello').then(rst => console.log(rst));
        res.reply(message.Recognition);
    } else if(message.MsgType === 'event' && message.Event === 'subscribe') {
        await saveUser(message, req.log);
        res.reply('欢迎关注本公众号！');
    }

    else {
        res.reply('');
    }

}))


module.exports = router
