/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Database errors
  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      success: false,
      error: 'Database error occurred',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.details || err.message
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
}

module.exports = errorHandler;