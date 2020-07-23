const _ = require('lodash')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const config = require('../config')

const MODULE = 'services/helper'

const helper = {
  /**
   * Get the configuration
   * @param {String} path - path of the configuration
   * @return {Object} the configuration object
   */
  getConfig(path) {
    return path ? _.get(config, path) : config
  },

  /**
   * Check if the required fields exist
   * @param {Object} target
   * @param {String[]} required
   * @returns {Boolean}
   */
  checkRequired(target, required) {
    const missing = required.filter((path) => _.get(target, path) == null)
    if (missing.length) {
      throw new errors.UnprocessableEntityError(`${missing} are required`)
    }
    return true
  }
}

module.exports = _.mixin(helper)
