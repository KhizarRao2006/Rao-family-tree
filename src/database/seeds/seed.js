const database = require('../database');

async function runSeed() {
  try {
    // Check if data already exists
    const existingCount = await database.get('SELECT COUNT(*) as count FROM family_members');
    
    if (existingCount.count > 0) {
      console.log('ℹ️  Database already seeded, skipping...');
      return;
    }
    
    // Seed data - Rao family
    const members = [
      // Generation 1 - Founder
      {
        first_name: 'Nana',
        last_name: 'Rao',
        birth_year: 1850,
        death_year: 1920,
        generation: 1,
        parent_id: null,
        biography: 'Founder of the Rao family dynasty. Established family traditions and values that would endure for generations. Known for his wisdom and leadership in the community.',
        is_alive: false
      },
      // Generation 2
      {
        first_name: 'Kabeer',
        last_name: 'Rao',
        birth_year: 1880,
        death_year: 1950,
        generation: 2,
        parent_id: 1,
        biography: 'Expanded family influence in the region and strengthened business connections. Under his leadership, the family business grew significantly.',
        is_alive: false
      },
      // Generation 3
      {
        first_name: 'Mubarak',
        last_name: 'Rao',
        birth_year: 1910,
        death_year: 1980,
        generation: 3,
        parent_id: 2,
        biography: 'Known for philanthropic work and community leadership during challenging times. Established several charitable foundations that continue to operate today.',
        is_alive: false
      },
      // Generation 4
      {
        first_name: 'Ashraf',
        last_name: 'Rao',
        birth_year: 1940,
        death_year: 2010,
        generation: 4,
        parent_id: 3,
        biography: 'Modernized family business ventures while preserving traditional values. Successfully navigated the family through economic changes and global expansion.',
        is_alive: false
      },
      // Generation 5
      {
        first_name: 'Muhammad Bin Ashraf',
        last_name: 'Rao',
        birth_year: 1970,
        death_year: null,
        generation: 5,
        parent_id: 4,
        biography: 'Current head of family enterprises. Focused on global expansion and digital transformation. Under his leadership, the family business has entered new international markets.',
        is_alive: true
      },
      // Generation 6
      {
        first_name: 'Khizar Bin Muhammad',
        last_name: 'Rao',
        birth_year: 2000,
        death_year: null,
        generation: 6,
        parent_id: 5,
        biography: 'Next generation leader with interests in technology and sustainable business practices. Currently pursuing higher education while learning the family business.',
        is_alive: true
      }
    ];
    
    // Insert members
    for (const member of members) {
      await database.run(
        `INSERT INTO family_members (
          first_name, last_name, birth_year, death_year, generation, parent_id, biography, is_alive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          member.first_name,
          member.last_name,
          member.birth_year,
          member.death_year,
          member.generation,
          member.parent_id,
          member.biography,
          member.is_alive
        ]
      );
    }
    
    console.log(`✅ Seed completed: ${members.length} family members added`);
    return true;
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  runSeed().then(() => {
    console.log('Seed script completed');
    process.exit(0);
  }).catch(error => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });
}

module.exports = runSeed;