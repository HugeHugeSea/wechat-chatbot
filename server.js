/**
 * [IMPORTANT]
 *
 * This module controls the clustering of the application. Unless you are
 * customizing the start/stop logic (e.g. graceful shutdown), you *DO NOT* need
 * to modify this file most probably.
 *
 * You shall take a look at `app.js` to customize the application logic.
 */

require('./src/init')

const cluster = require('cluster')
const gracefulShutdown = require('@devops/graceful-shutdown')
const numCpus = require('os').cpus().length
const logger = log.child({ module: 'server' })
const app = require('./app')

const port = process.env.NODE_PORT || 3000

if (cluster.isMaster) {
  setupMaster()
} else {
  setupWorker()
}

/**
 * Setup the cluster master. It will fork the worker process.
 */
function setupMaster() {
  let numWorkersDefault = Math.min(numCpus, 4)
  let numWorkers = parseInt(process.env.NODE_WORKER)
  numWorkers = Number.isInteger(numWorkers) ? numWorkers : numWorkersDefault
  if (numWorkers > numCpus) {
    logger.warn(`[master/${process.pid}] WARN: number of workers must not be greater than the number of CPUs`)
    numWorkers = numCpus
  }

  if (numWorkers < 2) {
    setupWorker()
    return
  }

  logger.info(`[master/${process.pid}] Forking ${numWorkers} worker processes...`)
  let restart = true
  let shutdown = () => {}

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.info(`[master/${process.pid}] One of the workers (pid: ${worker.process.pid}) died.`)
    if (restart) {
      cluster.fork()
    } else if (Object.keys(cluster.workers).length === 0) {
      shutdown()
    }
  })

  gracefulShutdown
    .config({
      buffer: -1,
      prepare: () => {
        logger.info(`[master/${process.pid}] Waiting for the workers to die...`)
        restart = false
        for (let id in cluster.workers) {
          process.kill(cluster.workers[id].process.pid)
        }
        return new Promise((resolve) => {
          shutdown = resolve
        })
      },
      goodbye,
    })
    .listen()
}

/**
 * Setup the cluster worker. It will start the server.
 */
function setupWorker() {
  const server = app.listen(port, () => {
    logger.info(`[worker/${process.pid}] Application is running on port ${port}...`)
  })

  // Reference: https://git.cathaypacific.com/imttcw/nodejs-graceful-shutdown
  gracefulShutdown
    .config({
      prepare: () => logger.info(`[worker/${process.pid}] Prepare for shutdown...`),
      cleanup: () => logger.info(`[worker/${process.pid}] Cleanup everything...`),
      goodbye,
    })
    .monitor(server, { closeServerTimeout: 15000 })
    .listen()
}

/**
 * Print a good-bye message.
 * @param {integer} code
 * @param {string} reason
 */
function goodbye(code, reason) {
  const role = cluster.isMaster ? 'master' : 'worker'
  logger.info(`[${role}/${process.pid}] Finally: ${reason} (exit code: ${code})`)
}

module.exports = cluster
