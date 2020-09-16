const router = require('express').Router();
const wechat = require('wechat');
const mediaManagement = require('../../common/mediaManagement');
const Dialogflow = require('../../services/dialogflow');
const firebase = require("firebase");
const admin = require("firebase-admin");
const moment = require("moment-timezone");


const wechatConfig = _.getConfig('wechat').wechat;
const dialogFlowConfig = _.getConfig('dialogflow');




const dialogflow = new Dialogflow(dialogFlowConfig.dialogflow);



const {
     saveUser,
    getDialogFlowMsg,
    getUserList,
    getWechatMsgByOpenId,
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
        const message = req.body;
        const response = await saveUser(message, req.log);
        res.json(response);
    }
)

router.use('/', wechat(wechatConfig, async function(req, res, next) {
    console.log(req.weixin);
    const message = req.weixin;

    //文本
    if (message.MsgType === 'text') {
        //const response = await dialogflow.detectIntent(message.FromUserName, message);
        const response = await  getDialogFlowMsg(message, req.log);
        res.reply(response);
    } else if(message.MsgType === 'voice') {
        //mediaManagement.sendText('hello').then(rst => console.log(rst));
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
