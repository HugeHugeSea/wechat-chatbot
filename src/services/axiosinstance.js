const axios = require('axios')
const https = require('https')

module.exports = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});
