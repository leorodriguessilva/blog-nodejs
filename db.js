'use strict';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const createTables = () => {
    db.serialize(() => {
        db.run("CREATE TABLE users (id INTEGER primary key, username VARCHAR(100) unique, password VARCHAR(200), created_at TIMESTAMP);");
        db.run("CREATE TABLE posts (id INTEGER primary key, author INTEGER, post TEXT, posted_at TIMESTAMP);");
    });
}

module.exports = { createTables, db };