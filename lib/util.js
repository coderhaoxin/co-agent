'use strict'

/**
 * exports
 */

module.exports = {
  handleError,
  noop
}

function handleError(error) {
  console.error(error)
}

function noop() {}
