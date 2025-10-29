const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class FamilyDatabase {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    try {
      // Ensure data directory exists
      const dataDir = path.join(__dirname, '../../../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const dbPath = process.env.DB_PATH || path.join(dataDir, 'family.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Database connection failed:', err);
        } else {
          console.log(`📁 Database connected: ${dbPath}`);
          // Enable foreign keys and better performance
          this.db.run('PRAGMA foreign_keys = ON');
          this.db.run('PRAGMA journal_mode = WAL');
        }
      });
      
      return this.db;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  getDb() {
    if (!this.db) {
      this.init();
    }
    return this.db;
  }

  // Promise wrapper for database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed.');
        }
      });
      this.db = null;
    }
  }
}

module.exports = new FamilyDatabase();