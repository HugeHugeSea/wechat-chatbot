const router = require('express').Router();
const wechat = require('wechat');
const wechatAPI = require('wechat-api');
const redisClient = require('../../services/redisClient');

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

function sendText(text) {
    return new Promise((resolve, reject) => {
        api.sendText('oFCMct1iw56TlW7bAgC7BrdN3kPE', text,  (err, result) => {
            if (err) {
                reject(err);
            };
            resolve(result)
        });
    })

}



const {
  reply,
} = require('../../services/middlewares')

router.get('/getAccessToken',
    function (req, res, next) {
        res.send({access:'access_token'});
    }
)


router.post('/', wechat(wechatConfig, function(req, res, next) {
    console.log(req.weixin);
    var message = req.weixin;
    //文本
    if (message.Content === '1') {

        res.reply('hehe');
        sendText('hello world').then(rst => console.log(rst));
    }else {
        res.reply('');
    }

}))


module.exports = router
