'use strict'

const assert = require('assert')
const knex = require('knex')

class Adaptor {
  constructor(opts) {
    assert(typeof opts === 'object', 'invalid options')
    assert(typeof opts.table === 'string', 'table required')

    // init store
    const store = this.store = knex(opts)

    const onerror = opts.onerror || handleError
    const connected = opts.connected || noop
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

          return false
        })
        .then(connected)
        .catch(onerror)
    }
  }

  /**
   * @param {String} entity
   * @param {String} id
   */
  findOne(entity, id) {
    return this
      .store(this.table)
      .where(this.key, id)
      .then(function(rows) {
        return rows && rows[0]
      })
  }

  create(entity, data) {
    return this
      .store(this.table)
      .insert(data, this.key)
      .then(function(ids) {
        return {
          id: ids && ids[0],
          inserted: true
        }
      })
  }

  update(entity, id, data) {
    return this.store(this.table).where(this.key, id).update(data)
  }

  remove(entity, id) {
    return this.store(this.table).where(this.key, id).del()
  }

  query(entity, opts) {
    return this.store(this.table).where(opts)
  }
}

function handleError(error) {
  console.error(error)
}

function noop() {}

/**
 * exports
 */

module.exports = Adaptor
