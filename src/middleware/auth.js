const bcrypt = require('bcryptjs');

// Simple in-memory session check
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    
    return res.status(401).json({
        success: false,
        error: 'Authentication required'
    });
};

// Admin login function
const login = async (username, password) => {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === adminUsername && password === adminPassword) {
        return true;
    }
    
    return false;
};

module.exports = {
    requireAuth,
    login
};