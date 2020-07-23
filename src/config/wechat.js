const env = process.env

module.exports = {
    wechat: {
        appID: env.APP_ID,
        appSecret: env.APP_SECRET,
        token: env.TOKEN,
        encodingAESKey : '',
        checkSignature: true
    }
}
