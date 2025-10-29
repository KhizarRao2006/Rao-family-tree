const path = require('path');
const Database = require('better-sqlite3');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';

// Global test setup
global.testDb = null;

beforeAll(() => {
  // Create in-memory database for tests
  global.testDb = new Database(':memory:');
  
  // Run migrations
  const createTableSQL = `
    CREATE TABLE family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birth_year INTEGER,
      death_year INTEGER,
      generation INTEGER NOT NULL,
      parent_id INTEGER,
      photo_url TEXT,
      biography TEXT,
      is_alive BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES family_members (id)
    )
  `;
  
  global.testDb.exec(createTableSQL);
  
  // Insert test data
  const insert = global.testDb.prepare(`
    INSERT INTO family_members (first_name, last_name, birth_year, generation, biography)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  insert.run('Test', 'User', 1990, 1, 'Test biography');
});

afterAll(() => {
  if (global.testDb) {
    global.testDb.close();
  }
});