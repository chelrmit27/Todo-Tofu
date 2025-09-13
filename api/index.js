// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });

// Import the built Express app
const { default: app } = require('../server/dist/app.js');

// Export the serverless function handler
module.exports = async (req, res) => {
  try {
    // Set NODE_ENV to production for Vercel
    process.env.NODE_ENV = 'production';
    
    // Pass the request to the Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
