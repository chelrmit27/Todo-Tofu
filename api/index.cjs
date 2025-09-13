// Vercel serverless function entry point
try {
  const app = require('../server/dist/app.js');
  console.log('App loaded successfully:', typeof app, typeof app.default);
  
  // Export the default export (the Express app)
  module.exports = app.default || app;
} catch (error) {
  console.error('Error loading app:', error);
  
  // Fallback handler that shows the error
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Failed to load application',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  };
}
