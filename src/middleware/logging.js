const morgan = require('morgan');

// Custom token for request body (for debugging)
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    return JSON.stringify(req.body);
  }
  return '';
});

// Custom format based on environment
const format = process.env.NODE_ENV === 'production' 
  ? ':remote-addr - :method :url :status :res[content-length] - :response-time ms'
  : ':method :url :status :res[content-length] - :response-time ms :body';

module.exports = morgan(format);