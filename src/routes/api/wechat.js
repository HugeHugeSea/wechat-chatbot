const router = require('express').Router();
const wechat = require('wechat');
const test = require('../../common/mediaManagement');

const wechatConfig = _.getConfig('wechat').wechat;

router.get('/upload',
    async function (req, res, next) {

        const filepath = 'C:/javadev/upload/test/videoTest.mp4';
        const type = 'video';
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

router.use('/', wechat(wechatConfig, function(req, res, next) {
    console.log(req.weixin);
    var message = req.weixin;
    //文本
    if (message.Content === '1') {

        res.reply('hehe');
        //test.sendText('hello world').then(rst => console.log(rst));
    }else if(message.Content === '2') {
        res.reply({
            type: "image",
            content: {
                mediaId: 'QKbGRuXUj0IBuVU1GOQn2yuBFjpVK4zWWSxO36qTKK4'
            }
        });
    }else if(message.Content === '3') {
        res.reply({
            type: "voice",
            content: {
                mediaId: 'QKbGRuXUj0IBuVU1GOQn2-89WdAx4GLsC66uyqmeDyc'
            }
        });
    }else if(message.Content === '4') {
        res.reply({
            type: "video",
            content: {
                title: '测试视频',
                description: '风景',
                mediaId: 'QKbGRuXUj0IBuVU1GOQn25EnXaX4b1Qiyo9pdF4DqJs'
            }
        })
    }else if(message.Content === '5') {
        res.reply([
            {
                title: '图文消息',
                description: '测试图文消息',
                picurl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2089197116,3194370600&fm=26&gp=0.jpg',
                url: 'https://mp.weixin.qq.com/s/QJez8aJgM27WdXH8XSNjow'
            }
        ])
    }else if(message.MsgType === 'voice') {
        res.reply('hehe');
    }

    else {
        res.reply('');
    }

}))


module.exports = router
