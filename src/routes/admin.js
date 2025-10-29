const express = require('express');
const router = express.Router();
const database = require('../database/database');
const { requireAuth, login } = require('../middleware/auth');
const { validateFamilyMember } = require('../utils/validation');
const fs = require('fs').promises;
const path = require('path');
const { Parser } = require('json2csv');

// Admin login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }
        
        const isAuthenticated = await login(username, password);
        
        if (isAuthenticated) {
            req.session.isAuthenticated = true;
            req.session.username = username;
            
            return res.json({
                success: true,
                message: 'Login successful',
                user: { username }
            });
        } else {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

// Admin logout endpoint
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }
        
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

// Check auth status
router.get('/check-auth', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        res.json({
            success: true,
            authenticated: true,
            user: { username: req.session.username }
        });
    } else {
        res.json({
            success: true,
            authenticated: false
        });
    }
});

// Protected admin routes - require authentication
router.use(requireAuth);

// Get all family members (admin version with more data)
router.get('/family', async (req, res, next) => {
    try {
        const members = await database.all(`
            SELECT 
                id,
                first_name,
                last_name,
                birth_year,
                death_year,
                generation,
                parent_id,
                photo_url,
                biography,
                is_alive,
                created_at,
                updated_at
            FROM family_members 
            ORDER BY generation, parent_id, id
        `);
        
        res.json({
            success: true,
            data: members,
            count: members.length
        });
    } catch (error) {
        next(error);
    }
});

// Get database schema and data
router.get('/database', async (req, res, next) => {
    try {
        // Get all tables
        const tables = await database.all(`
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            AND name NOT LIKE 'sqlite_%'
        `);
        
        const databaseInfo = {
            tables: [],
            totalRecords: 0
        };
        
        // Get data for each table
        for (const table of tables) {
            const tableInfo = await database.all(`PRAGMA table_info(${table.name})`);
            const tableData = await database.all(`SELECT * FROM ${table.name} LIMIT 1000`);
            const rowCount = await database.get(`SELECT COUNT(*) as count FROM ${table.name}`);
            
            databaseInfo.tables.push({
                name: table.name,
                schema: tableInfo,
                data: tableData,
                rowCount: rowCount.count
            });
            
            databaseInfo.totalRecords += rowCount.count;
        }
        
        res.json({
            success: true,
            data: databaseInfo
        });
    } catch (error) {
        next(error);
    }
});

// Get specific table data
router.get('/database/:table', async (req, res, next) => {
    try {
        const { table } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        // Validate table name to prevent SQL injection
        const validTables = await database.all(`
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            AND name NOT LIKE 'sqlite_%'
        `);
        
        const tableExists = validTables.some(t => t.name === table);
        if (!tableExists) {
            return res.status(404).json({
                success: false,
                error: 'Table not found'
            });
        }
        
        // Get table schema
        const schema = await database.all(`PRAGMA table_info(${table})`);
        
        // Get total count
        const countResult = await database.get(`SELECT COUNT(*) as total FROM ${table}`);
        
        // Get paginated data
        const data = await database.all(`
            SELECT * FROM ${table} 
            LIMIT ? OFFSET ?
        `, [parseInt(limit), offset]);
        
        res.json({
            success: true,
            data: {
                table,
                schema,
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult.total,
                    totalPages: Math.ceil(countResult.total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Export database (download)
router.get('/database-export', async (req, res, next) => {
    try {
        const allData = {};
        
        // Get all tables
        const tables = await database.all(`
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            AND name NOT LIKE 'sqlite_%'
        `);
        
        for (const table of tables) {
            const data = await database.all(`SELECT * FROM ${table.name}`);
            allData[table.name] = data;
        }
        
        res.json({
            success: true,
            data: allData,
            exportedAt: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});


router.get('/database-backup', async (req, res, next) => {
  try {
    const backupData = {};
    
    // Get all tables
    const tables = await database.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
    `);
    
    for (const table of tables) {
      const data = await database.all(`SELECT * FROM ${table.name}`);
      backupData[table.name] = data;
    }
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../../backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const backupFileName = `family-backup-${timestamp}`;
    
    // Save as JSON
    const jsonPath = path.join(backupDir, `${backupFileName}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(backupData, null, 2));
    
    // Save as CSV
    const csvPath = path.join(backupDir, `${backupFileName}.csv`);
    let csvData = '';
    
    for (const [tableName, tableData] of Object.entries(backupData)) {
      if (tableData.length > 0) {
        const parser = new Parser();
        const csv = parser.parse(tableData);
        csvData += `=== ${tableName} ===\n${csv}\n\n`;
      }
    }
    
    await fs.writeFile(csvPath, csvData);
    
    res.json({
      success: true,
      message: 'Backup created successfully',
      files: {
        json: jsonPath,
        csv: csvPath
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Database import endpoint
router.post('/database-import', async (req, res, next) => {
  try {
    const { importData, format } = req.body;
    
    if (!importData || !format) {
      return res.status(400).json({
        success: false,
        error: 'Import data and format are required'
      });
    }
    
    let data;
    if (format === 'json') {
      data = typeof importData === 'string' ? JSON.parse(importData) : importData;
    } else if (format === 'csv') {
      // CSV import logic would go here
      return res.status(501).json({
        success: false,
        error: 'CSV import not yet implemented'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported format. Use JSON or CSV'
      });
    }
    
    // Import data table by table
    for (const [tableName, tableData] of Object.entries(data)) {
      if (Array.isArray(tableData)) {
        // Clear existing data
        await database.run(`DELETE FROM ${tableName}`);
        
        // Insert new data
        for (const row of tableData) {
          const columns = Object.keys(row).join(', ');
          const placeholders = Object.keys(row).map(() => '?').join(', ');
          const values = Object.values(row);
          
          await database.run(
            `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
            values
          );
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Database imported successfully',
      importedTables: Object.keys(data)
    });
  } catch (error) {
    next(error);
  }
});

// Update database record
router.put('/database/:table/:id', async (req, res, next) => {
  try {
    const { table, id } = req.params;
    const updates = req.body;
    
    // Validate table name
    const validTables = await database.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
    `);
    
    const tableExists = validTables.some(t => t.name === table);
    if (!tableExists) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }
    
    // Build update query
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    const result = await database.run(
      `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      values
    );
    
    res.json({
      success: true,
      message: 'Record updated successfully',
      changes: result.changes
    });
  } catch (error) {
    next(error);
  }
});

// Delete database record
router.delete('/database/:table/:id', async (req, res, next) => {
  try {
    const { table, id } = req.params;
    
    // Validate table name
    const validTables = await database.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
    `);
    
    const tableExists = validTables.some(t => t.name === table);
    if (!tableExists) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }
    
    const result = await database.run(
      `DELETE FROM ${table} WHERE id = ?`,
      [id]
    );
    
    res.json({
      success: true,
      message: 'Record deleted successfully',
      changes: result.changes
    });
  } catch (error) {
    next(error);
  }
});

// Get list of backup files
router.get('/backup-files', async (req, res, next) => {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    
    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('family-backup-'))
        .map(file => {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime
          };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));
      
      res.json({
        success: true,
        data: backupFiles
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Backup directory doesn't exist
        await fs.mkdir(backupDir, { recursive: true });
        res.json({
          success: true,
          data: []
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
});
module.exports = router;