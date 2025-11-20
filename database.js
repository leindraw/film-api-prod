require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();

const DB_SOURCE = process.env.DB_SOURCE;

const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Terhubung ke basis data SQLite');

        db.run(`
            CREATE TABLE IF NOT EXISTS movies(
            id INTEGER PRIMARY KEY AUTOINCREMENT,   
            title TEXT NOT NULL,
            director TEXT NOT NULL,
            year INTEGER NOT NULL
        )`, (err) => {
            if (err) { /** Tabel Sudah ada */ }
            else {
                const insert = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';
                db.run(insert, ["Parasite", "Bong Joon-ho", 2019]);
                db.run(insert, ["The Dark Knight", "Christopher Nolan", 2008]);
            }
        });
    }
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT ’user’
)`, (err) => {
    if (err) {
        console.error("Gagal membuat tabel users: ", err.message);
    }
});

module.exports = db;