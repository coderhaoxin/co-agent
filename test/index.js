'use strict'

const assert = require('assert')
const Adaptor = require('../')

describe('## koao-knex', function() {
  describe('# basic', function() {
    let table = 'testkoao'
    let adaptor
    let id

    it('init', function() {
      return new Promise(function(resolve, reject) {
        adaptor = new Adaptor({
          client: 'pg',
          connection: 'postgres://koaoknex@localhost/koaoknex',
          pool: {
            min: 5,
            max: 10
          },

          tables: [{
            name: table,
            createTable: function(t) {
              t.increments('id').primary()
              t.string('name', 100)
              t.string('desc', 100)
            }
          }],

          connected: resolve,
          onerror: reject
        })
      })
    })

    it('create', function() {
      return adaptor
        .create(table, {
          name: 'haoxin',
          desc: 'hello'
        })
        .then(function(result) {
          assert.equal(result.inserted, true)
          id = result.id
        })
    })

    it('update', function() {
      return adaptor
        .update(table, id, {
          desc: 'world'
        })
        .then(function(count) {
          assert.equal(count, 1)
        })
    })

    it('findOne', function() {
      return adaptor
        .findOne(table, id)
        .then(function(result) {
          assert.equal(result.name, 'haoxin')
          assert.equal(result.desc, 'world')
        })
    })

    it('query', function() {
      return adaptor
        .query(table, {
          desc: 'world'
        })
        .then(function(result) {
          assert(result.length > 0)
        })
    })

    it('remove', function() {
      return adaptor
        .remove(table, id)
        .then(function(count) {
          assert.equal(count, 1)
        })
    })

    it('findOne', function() {
      return adaptor
        .findOne(table, id)
        .then(function(result) {
          assert.equal(result, undefined)
        })
    })
  })
})
