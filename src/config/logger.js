const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Hongkong')

const prettyPrint = (env.LOG_PRETTY_PRINT==='true');

module.exports = {
  level: env.LOG_LEVEL || 'info',
  prettyPrint: prettyPrint,
  timestamp: prettyPrint ? () => {
    let timeStr = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss.SSS')
    return `,"time":"${timeStr}"`
  } : true,
  serializers: {
    err: errors.bunyanSerializer,
  }
};
