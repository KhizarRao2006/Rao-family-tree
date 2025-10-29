const fs = require('fs');
const path = require('path');
const database = require('./src/database/database');
const runMigration = require('./src/database/migrations/001_create_family_table');
const runSeed = require('./src/database/seeds/seed');

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // Close existing connection
    database.close();
    
    // Delete database file
    const dbPath = path.join(__dirname, 'data', 'family.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('🗑️  Deleted old database file');
    }
    
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Initialize database and run migration/seed
    await database.init();
    await runMigration();
    await runSeed();
    
    console.log('✅ Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();