import Database from 'better-sqlite3';

// Initialize the database
const db = new Database('database.db');

// Create a users table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL 
  )
`);

db.exec( `
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    hours TEXT,
    category TEXT,
    coordinates TEXT, -- stored as a JSON string
    avergaeRaating REAL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES users(id)
  )
`)

console.log("Database initialized successfuilly");
export default db;
   