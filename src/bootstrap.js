/**
 * Initialize models using bookshelf-model-loader and create the schema
 * @package test
 */

var knex = require('knex');
var bookshelf = require('bookshelf');
var loader = require('bookshelf-model-loader');
var path = require('path');
var Promise = require('bluebird');
var fs = require('q-io/fs');
var dbFile = path.join(__dirname, '..', 'data', 'data.db');
var chance = require('chance').Chance();
var datastore;

function insert(cant, gender) {
  return Promise.map(new Array(cant).join(0).split(0).map(Number.call, Number), function() {
    return datastore.knex('person').insert({
      firstname: chance.first(),
      lastname: chance.last(),
      gender: gender
    });
  });
}

function initilize() {
  return fs.exists(dbFile).then(
    function(exists) {
      if (exists) {
        return fs.remove(dbFile);
      }
    }

  )
    .then(function() {
      datastore = bookshelf(knex({
        client: 'sqlite',
        connection: {
          filename: dbFile
        }
      }));

      loader.init(datastore, {
        plugins: ['virtuals', 'visibility', 'registry'],
        excludes: [],
        path: __dirname + '/models'
      });
    }).delay(500)
    .then(function() {
      return Promise.all([
        datastore.knex.schema.createTable('language',
          function(table) {
            table.increments();
            table.string('name');
          }

        ),
        datastore.knex.schema.createTable('person',
          function(table) {
            table.increments();
            table.string('firstname');
            table.string('lastname');
            table.string('gender');
          }

        ),
        datastore.knex.schema.createTable('person_speaks_language',
          function(table) {
            table.integer('person_id');
            table.integer('language_id');
            table.primary('person_id', 'language_id');
          }

        )
      ]);
    })
    .then(
    function() {
      return Promise.all([insert(50, 'female'), insert(30, 'male')]);
    }

  );

}

module.exports = {
  initialize: initilize
};