const bcrypt = require('bcryptjs');

// Simple admin credentials (in production, use environment variables)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'Khizarraohere' 
};

// Login function
async function login(username, password) {
  try {
    // In a real app, you'd check against a database
    // For now, use simple comparison with environment variables
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      return true;
    }
    
    // Optional: Add bcrypt comparison if you hash passwords
    // return await bcrypt.compare(password, hashedPasswordFromDB);
    
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

// Require auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  
  return res.status(401).json({
    success: false,
    error: 'Authentication required'
  });
}

module.exports = {
  login,
  requireAuth
};