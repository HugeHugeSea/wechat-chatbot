const router = require('express').Router();
const wechat = require('wechat');
const mediaManagement = require('../../common/mediaManagement');
const Dialogflow = require('../../services/dialogflow');

const wechatConfig = _.getConfig('wechat').wechat;
const dialogFlowConfig = _.getConfig('dialogflow');

const dialogflow = new Dialogflow(dialogFlowConfig.dialogflow);

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

router.use('/', wechat(wechatConfig, async function(req, res, next) {
    console.log(req.weixin);
    const message = req.weixin;
    //文本
    if (message.MsgType === 'text') {
        const response = await dialogflow.detectIntent(message.FromUserName, message);
        res.reply(response);
    } else if(message.MsgType === 'voice') {
        //mediaManagement.sendText('hello').then(rst => console.log(rst));
        res.reply(message.Recognition);
    }

    else {
        res.reply('');
    }

}))


module.exports = router
