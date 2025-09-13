import express from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './config/database';
import routes from './routes';

// Connect to Database
connectDB();

const app = express();

// --- Core Middleware ---
// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' && process.env.VERCEL
      ? true  // Allow all origins in Vercel production for now
      : ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  }),
);
// Parse incoming JSON requests
app.use(express.json());
// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// This is where we mount our API routes
// In serverless (Vercel), routes come without the /api prefix
if (process.env.VERCEL) {
  app.use('/', routes);
} else {
  app.use('/api', routes);
}

// Serve static files from the client build in production
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  // Only serve static files when not on Vercel (Vercel handles static files)
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // Handle client-side routing by serving index.html for non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
} else if (!process.env.VERCEL) {
  app.get('/', (_req, res) => {
    res.send('API is running...');
  });
}

export default app;
