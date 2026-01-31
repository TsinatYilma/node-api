// auth/jwt.ts
const jwt: any = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Signs a payload and returns a token
export function signToken(payload: object, expiresIn = '1h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Verifies a token and returns the decoded payload
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid token');
  }
}

export function extractEmailFromToken(token: string): string {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { email?: string; id?: string };
      // Use email if available, otherwise fallback to id
      return payload.email || payload.id || '';
    } catch (err) {
      console.error('Invalid JWT token:', err);
      return '';
    }
  }