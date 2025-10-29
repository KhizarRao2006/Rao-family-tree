const express = require('express');
const router = express.Router();
const database = require('../database/database');
const { requireAuth, login } = require('../middleware/auth');
const { validateFamilyMember } = require('../utils/validation');

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

module.exports = router;