const mysql = require('mysql');
const colors = require('colors');
const { promisify } = require('util');

const { database } = require('./keys');

const db = mysql.createPool(database);

db.getConnection((err,conn) => {
    if (err) {
        console.log('[SERVER] Error while connecting to the database'.red);
        console.log(err.code.red);
    }
    if (conn) {
        conn.release();
        console.log('[SERVER] Database is connected'.green);
    }
    return;
});

db.query = promisify(db.query);

module.exports = db;