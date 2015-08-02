'use strict'

const Adaptor = require('../').User
const assert = require('assert')

describe('## koao-knex - user', function() {
  describe('# basic', function() {
    let username = Date.now() + '-' + Math.random()
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

          table: 'user',
          createTable: function(t) {
            t.increments('id').primary()
            t.string('username', 100)
            t.string('password', 100)
          },

          connected: resolve,
          onerror: reject
        })
      })
    })

    it('not exist', function() {
      return adaptor
        .exist(['username'], {
          username: username
        })
        .then(function(result) {
          assert.equal(result, false)
        })
    })

    it('signup', function() {
      return adaptor
        .signup({
          username: username,
          password: '123456'
        })
        .then(function(result) {
          assert.equal(result.inserted, true)
          id = result.id
        })
    })

    it('update', function() {
      return adaptor
        .update(id, {
          password: '234567'
        })
        .then(function(count) {
          assert.equal(count, 1)
        })
    })

    it('exist', function() {
      return adaptor
        .exist(['username'], {
          username: username
        })
        .then(function(result) {
          assert.equal(result, true)
        })
    })

    it('findUser', function() {
      return adaptor
        .findUser(['username'], {
          username: username
        })
        .then(function(result) {
          assert.equal(result.username, username)
        })
    })

    it('findById', function() {
      return adaptor
        .findById(id)
        .then(function(result) {
          assert.equal(result.username, username)
        })
    })
  })
})
