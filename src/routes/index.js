const express = require('express');
const router = express.Router();
const siteContentRoutes = require('./site-content'); // Add this line

/**
 * @route GET /api
 * @description API status endpoint
 * @access Public
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Rao Family Tree API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/health
 * @description Health check endpoint
 * @access Public
 */
router.get('/health', (req, res) => {
  const database = require('../database/database');
  
  try {
    // Check database connection
    const db = database.getDb();
    const result = db.prepare('SELECT 1 as status').get();
    
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
router.use('/site-content', siteContentRoutes); // Add this line

module.exports = router;