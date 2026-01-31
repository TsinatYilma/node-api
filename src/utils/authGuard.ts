// utils/authGuard.ts
import { IncomingMessage, ServerResponse } from 'http';
import { User } from '../models/User.model';

const jwt: any = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware-like function to protect routes
export async function authGuard(req: IncomingMessage, res: ServerResponse): Promise<{ userId: string } | null> {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Authorization header missing meee' }));
    return null;
  }

  const token = (authHeader as string).replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    // Optional: verify user exists in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid token: user not found' }));
      return null;
    }

    return { userId: decoded.id }; // you can attach more info if needed
  } catch (err) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid token' }));
    return null;
  }
}
