const env = process.env

let dialogflow = {};

if (env.WECHAT_DIALOGFLOW) {
    dialogflow = JSON.parse(env.WECHAT_DIALOGFLOW);
}

module.exports = {
    dialogflow
};
