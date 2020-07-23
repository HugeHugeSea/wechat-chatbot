const router = require('express').Router()

const clientsRoute = require('./wechat')

const { reply, errorHandler } = require('../../services/middlewares')

// NOTE: The middlewares are wrapped by `reply` to standardize the response
// handling. The wrapper also enables the use of async/await with Express.

/**
 * @swagger
 * /cxbot-router/api/1.0:
 *   get:
 *     description: Get the API description.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: API description
 */
router.get('/', reply((req, res) => 'API v1.0'))

router.use('/wechat', clientsRoute)

router.use(errorHandler())

module.exports = router
