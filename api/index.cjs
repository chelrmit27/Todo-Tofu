// Vercel serverless function entry point
const express = require('express');

// Create a simple test function first to verify deployment
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple test response
  if (req.url === '/health') {
    res.status(200).json({
      status: 'OK',
      message: 'API is working',
      timestamp: new Date().toISOString(),
      vercel: true
    });
    return;
  }

  // For any other route, return a simple response for now
  res.status(200).json({
    message: 'API endpoint reached',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};
