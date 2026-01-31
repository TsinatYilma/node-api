import http, { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import handleAuth from './routes/auth';

dotenv.config();

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err: unknown) => console.error('MongoDB connection error:', err));

// Create HTTP server
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    // Root route
    if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Server is running!' }));
    }

    // /auth/* routes
    if (req.url?.startsWith('/auth')) {
      await handleAuth(req, res);
      return;
    }

    // 404 for all other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  } catch (err) {
    // Catch server errors
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
