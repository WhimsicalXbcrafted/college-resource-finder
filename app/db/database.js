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

console.log("Database initialized successfuilly");
export default db;
   