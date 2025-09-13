// Vercel serverless function entry point
const app = require('../server/dist/app.js');

// Export the default export (the Express app)
module.exports = app.default || app;
