const database = require('../database');

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    // Create family_members table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS family_members (
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
    
    await database.run(createTableSQL);
    
    // Create indexes for better performance
    await database.run('CREATE INDEX IF NOT EXISTS idx_generation ON family_members(generation)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_parent_id ON family_members(parent_id)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_is_alive ON family_members(is_alive)');
    
    console.log('✅ Migration completed: Family table created');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration().then(() => {
    console.log('Migration script completed');
    process.exit(0);
  }).catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = runMigration;