'use strict';

let dbm;
let type;
let seed;
let fs = require('fs');
let path = require('path');

let prom;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  prom = options.Promise;
};

exports.up = function (db) {
  let filePath = path.join(__dirname, 'sqls', '20210318100600-init-up.sql');
  return new Promise(function (resolve, reject) {
    receiveData(resolve, reject, filePath);
  }).then(function (data) {
    return db.runSql(data);
  });
};

exports.down = function (db) {
  let filePath = path.join(__dirname, 'sqls', '20210318100600-init-down.sql');
  return new Promise(function (resolve, reject) {
    receiveData(resolve, reject, filePath);
  }).then(function (data) {
    return db.runSql(data);
  });
};

function receiveData(resolve, reject, filePath) {
  fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
    if (err) return reject(err);
    console.log('received data: ' + data);

    resolve(data);
  });
}

exports._meta = {
  version: 1,
};
