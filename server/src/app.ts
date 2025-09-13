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
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  }),
);
// Parse incoming JSON requests
app.use(express.json());
// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// This is where we mount our API routes
app.use('/api', routes);

// Serve static files from the client build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from client/dist
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // Handle client-side routing by serving index.html for non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.send('API is running...');
  });
}

export default app;
