const api = require('./wechatApi')

function uploadMaterialInfo(filepath, type) {
    return new Promise((resolve, reject) => {
        api.uploadMaterial(filepath, type,  (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result)
        });
    })
}

function uploadVideoInfo(filepath, description) {
    return new Promise((resolve, reject) => {
        api.uploadVideoMaterial(filepath, description,  (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result)
        });
    })
}

const ctrl = {
    //客服文本消息
    sendText:function (text) {
        return new Promise((resolve, reject) => {
            api.sendText('oFCMct1iw56TlW7bAgC7BrdN3kPE', text,  (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result)
            });
        })
    },

    uploadMaterial: async function (filepath, type) {
        return await uploadMaterialInfo(filepath, type);
    },

    uploadVideo: async function (filepath, description) {
        return await uploadVideoInfo(filepath, description);
    }

}


module.exports = ctrl;
