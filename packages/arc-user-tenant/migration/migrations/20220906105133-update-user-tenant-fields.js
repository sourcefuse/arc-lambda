'use strict';

let dbm;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let type;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let seed;
const fs = require('fs');
const path = require('path');
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
  const filePath = path.join(
    __dirname,
    'sqls',
    '20220906105133-update-user-tenant-fields-up.sql',
  );
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
      if (err) return reject(err);
      console.log('received data: ' + data); // NOSONAR

      resolve(data);
    });
  }).then(function (data) {
    return db.runSql(data);
  });
};

exports.down = function (db) {
  const filePath = path.join(
    __dirname,
    'sqls',
    '20220906105133-update-user-tenant-fields-down.sql',
  );
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
      if (err) return reject(err);
      console.log('received data: ' + data); // NOSONAR

      resolve(data);
    });
  }).then(function (data) {
    return db.runSql(data);
  });
};

exports._meta = {
  version: 1,
};
