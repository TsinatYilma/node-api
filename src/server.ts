import http, { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import handleAuth from './routes/auth.controller';
import handleMembers from './routes/members.controller';
import handleBooks from './routes/books.controller'
import handleBorrowedBooks from './routes/borrowedBooks.controller'

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err: unknown) => console.error('MongoDB connection error:', err));

// Helper to set CORS headers
function setCorsHeaders(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Create HTTP server
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      setCorsHeaders(res);
      res.writeHead(204); // No content
      return res.end();
    }

    // Set CORS headers for all other requests
    setCorsHeaders(res);

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

    // /members/* routes
    if (req.url?.startsWith('/members')) {
      await handleMembers(req, res);
      return;
    }
    if (req.url?.startsWith('/books')) {
      await handleBooks(req, res);
      return;
    }
    if (req.url?.startsWith('/borrowedBooks')) {
      await handleBorrowedBooks(req, res);
      return;
    }

    // 404 for all other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
