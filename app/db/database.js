import Database from 'better-sqlite3';

const db = new Database('database.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    avatarUrl TEXT,
    emailNotifications BOOLEAN DEFAULT 1,
    pushNotifications BOOLEAN DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    hours TEXT,
    category TEXT,
    coordinates TEXT,
    averageRating REAL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`);

console.log('Database initialized successfully');
export default db;