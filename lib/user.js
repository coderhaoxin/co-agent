'use strict'

const assert = require('assert')
const util = require('./util')
const knex = require('knex')

class Adaptor {
  constructor(opts) {
    assert(typeof opts === 'object', 'invalid options')
    assert(typeof opts.table === 'string', 'table required')

    // init store
    const store = this.store = knex(opts)

    const onerror = opts.onerror || util.handleError
    const connected = opts.connected || util.noop
    const table = this.table = opts.table
    this.key = opts.key || 'id'

    if (opts.createTable) {
      store
        .schema
        .hasTable(table)
        .then(function(exist) {
          if (!exist) {
            return store.schema.createTable(table, opts.createTable)
          }
        })
        .then(connected)
        .catch(onerror)
    }
  }

  /**
   * @param {Array} uids
   * @param {Object} data
   */
  exist(uids, data) {
    let key = this.key

    return this
      .findUser(uids, data)
      .then(function(user) {
        return !!(user && user[key])
      })
  }

  signup(user) {
    return this
      .store(this.table)
      .insert(user, this.key)
      .then(function(ids) {
        return {
          id: ids && ids[0],
          inserted: true
        }
      })
  }

  update(id, data) {
    return this.store(this.table).where(this.key, id).update(data)
  }

  findUser(uids, data) {
    let query = {}
    uids.forEach(function(uid) {
      if (data.hasOwnProperty(uid)) {
        query[uid] = data[uid]
      }
    })

    return this
      .store(this.table)
      .orWhere(query)
      .then(function(rows) {
        return rows && rows[0]
      })
  }

  findById(id) {
    return this
      .store(this.table)
      .where(this.key, id)
      .then(function(rows) {
        return rows && rows[0]
      })
  }
}

/**
 * exports
 */

module.exports = Adaptor
