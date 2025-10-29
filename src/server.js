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
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"]
    }
  }
}));

// app.use(cors());
// CORS configuration
app.use(cors({
  origin: true, // Allow current origin
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development-only',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax', // Changed from strict to lax for Railway
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  // Added this for production session store
  store: process.env.NODE_ENV === 'production' ? 
    new session.MemoryStore() : undefined, // For production, use MemoryStore
  // Added proxy trust for Railway
  proxy: true
}));

// Add this after session middleware
app.set('trust proxy', 1); // Trust first proxy (Railway)

// Logging
app.use(morgan);

// Serve static files FIRST
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Rao Family Tree is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes - FIXED: Remove duplicate routes
app.use('/api', require('./routes/index'));

app.use('/backups', express.static(path.join(__dirname, '../backups')));
// Explicit admin route - MUST come before catch-all
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Catch all handler for SPA - MUST be last
app.get('*', (req, res) => {
  // Don't catch admin route
  if (req.path.startsWith('/admin')) {
    return res.status(404).send('Admin page not found');
  }
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
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`👑 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  });
});

module.exports = app;