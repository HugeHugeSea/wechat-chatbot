const router = require('express').Router();
const apiRouter = require('./api');
const healthRouter = require('./health');

router.get('/', (req, res) => res.send('Welcome!'));
router.get('/_health', healthRouter);
router.use('/wechat-chatbot/api/', apiRouter);

module.exports = router;
