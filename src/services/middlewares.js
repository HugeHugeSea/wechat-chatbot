const uuidv4 = require('uuid/v4')
const axiosinstance = require('./axiosinstance')

function _unauthenticated(realm, res, next) {
  res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`)
  next(new errors.UnauthorizedError('Authentication failed'))
}


module.exports = {


  /**
   * Create the express middleware which add request logger to the `req` object
   * @return {Middleware} the express middleware
   */
  setReqLogger() {
    return (req, res, next) => {
      const startTime = Date.now()
      const trace_id = req.header('trace_id') || uuidv4()
      req.headers.trace_id = trace_id
      req.log = log.child({ trace_id })

      // skip the request log from the health API
      if (req._parsedUrl.pathname === '/_health') {
        next()
        return
      }

      req.log.info({
        request: {
          httpVersion: req.httpVersion,
          method: req.method,
          pathname: req._parsedUrl.pathname,
          headers: _.pick(req.headers, ['host', 'user-agent', 'referer', 'x-forwarded-for']),
          remoteFamily: req.connection.remoteFamily,
          remoteAddress: req.connection.remoteAddress,
          remotePort: req.connection.remotePort,
        }
      }, 'received request')

      req.log.trace('received request (params: %j / query: %j / body: %j)', req.params, req.query, req.body)

      res.on('finish', () => {
        const time = Date.now() - startTime
        req.log.info({
          response: {
            time,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: {
              contentType: res.get('content-type'),
              contentLength: parseInt(res.get('content-length')) || 0,
            }
          }
        }, 'sent response')
      })

      next()
    }
  },

  /**
   * Wrap the middleware to standardize the response handling.
   * Reference: https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/
   * @param {Middleware} fn
   */
  reply(fn) {
    return (req, res, next) => {
      return Promise.resolve(fn(req))
        .then((data) => res.json(data))
        .catch((err) => next(err))
    }
  },

  errorHandler() {
    return (err, req, res, next) => {
      const _log = (req.log || logger).child({ module: '_outbound' });
      if (err == null) {
        next();
      } else {
        if (err.statusCode == null) {
          err = new errors.InternalServerError(err);
        }
        const status = err.statusCode;
        const errBody = {
          status: err.statusCode,
          title: 'General error',
          detail: err.message,
        };

        if (status >= 500) {
          errBody.code = err.code && err.code.indexOf('E') === 0 ? err.code : 'E200000';
          _log.error('sending error response:', errors.fullStack(err));
        } else if (status === 401) {
          errBody.code = err.code && err.code.indexOf('E') === 0 ? err.code : 'E200001';
          errBody.title = 'Authentication error';
          _log.warn('sending error response:', err.message);
        } else if (status === 404) {
          errBody.code = err.code && err.code.indexOf('E') === 0 ? err.code : 'E200002';
          errBody.title = 'Session not found';
          _log.warn('sending error response:', err.message);
        } else {
          errBody.code = err.code && err.code.indexOf('E') === 0 ? err.code : 'E200000';
          _log.warn('sending error response:', err.message);
        }
        _log.error({ error: errBody });
        res.status(status).json({ errors: [ errBody ] });
      }
    };
  },

}
