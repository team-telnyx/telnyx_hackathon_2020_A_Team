var sqlite3 = require("sqlite3").verbose();

const DBSOURCE = "./db/dev.db";

let db = new sqlite3.Database(DBSOURCE, err => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alias text,
            phone_number text UNIQUE,
            created_at text,
            points integer,
            CONSTRAINT phone_number_unique UNIQUE (phone_number),
            CONSTRAINT alias_unique UNIQUE (alias)
            )`
    );


    // This is the table of the 1st place winners for each puzzle
    db.run(
      `CREATE TABLE IF NOT EXISTS winners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phrase text,
            alias text,
            phone_number text UNIQUE,
            created_at text,
            CONSTRAINT phone_number_unique UNIQUE (phone_number),
            CONSTRAINT alias_unique UNIQUE (alias)
            )`
    );
}});

module.exports = db;
