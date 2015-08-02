'use strict'

const assert = require('assert')
const util = require('./util')
const knex = require('knex')

class Adaptor {
  constructor(opts) {
    assert(typeof opts === 'object', 'invalid options')

    // init store
    const store = this.store = knex(opts)

    const onerror = opts.onerror || util.handleError
    const connected = opts.connected || util.noop

    this.key = opts.key || 'id'

    if (opts.tables) {
      Promise.all(opts.tables.map(function(table) {
        if (!(table.name && table.createTable)) {
          return
        }

        return store
          .schema
          .hasTable(table.name)
          .then(function(exist) {
            if (!exist) {
              return store.schema.createTable(table.name, table.createTable)
            }
          })
      }))
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
      .store(entity)
      .where(this.key, id)
      .then(function(rows) {
        return rows && rows[0]
      })
  }

  create(entity, data) {
    return this
      .store(entity)
      .insert(data, this.key)
      .then(function(ids) {
        return {
          id: ids && ids[0],
          inserted: true
        }
      })
  }

  update(entity, id, data) {
    return this.store(entity).where(this.key, id).update(data)
  }

  remove(entity, id) {
    return this.store(entity).where(this.key, id).del()
  }

  query(entity, opts) {
    return this.store(entity).where(opts)
  }
}

/**
 * exports
 */

exports = module.exports = Adaptor
exports.User = require('./user')
