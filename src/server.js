require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const morgan = require('./middleware/logging');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware - UPDATED CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Logging
app.use(morgan);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', require('./routes/index'));
app.use('/api/family', require('./routes/family'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/site-content', require('./routes/site-content'));

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Catch all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use(errorHandler);

// Database initialization and auto-migration
const db = require('./database/database');
const runMigration = require('./database/migrations/001_create_family_table');
const runSeed = require('./database/seeds/seed');

async function initializeDatabase() {
  try {
    await db.init();
    console.log('📁 Database connected, checking for tables...');
    
    // Check if table exists, if not run migration and seed
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='family_members'"
    );
    
    if (!tableExists) {
      console.log('🔄 Table not found, running migration...');
      await runMigration();
      console.log('🔄 Migration completed, running seed...');
      await runSeed();
      console.log('✅ Database initialized successfully');
    } else {
      console.log('✅ Database table already exists');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`👑 Admin Panel: http://localhost:${PORT}/admin`);
  });
});

module.exports = app;