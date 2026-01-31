// routes/borrowedBooks.controller.ts
import { IncomingMessage, ServerResponse } from 'http';
import { borrowedBooksService } from '../services/borrowedBooks.service';
import { extractEmailFromToken } from '../Role/auth.jwt';// your token helper
import { Role } from '../Role/role';
import { verifyToken } from '../Role/auth.jwt'; // helper to check roles

function checkRole(req: IncomingMessage, roles: Role[]): boolean {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  return roles.includes(payload.role);
}

export default async function handleBorrowedBooks(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = req.url || '';
    const method = req.method || '';

    // Read body helper
    const getBody = async () => {
      return new Promise<any>((resolve, reject) => {
        let data = '';
        req.on('data', chunk => (data += chunk));
        req.on('end', () => resolve(JSON.parse(data || '{}')));
        req.on('error', err => reject(err));
      });
    };

    // -----------------------
    // POST /borrowedBooks/borrowed - Borrow book (admin only)
    if (url === '/borrowedBooks/borrowed' && method === 'POST') {
      if (!checkRole(req, [Role.LIBRARY_ADMIN])) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Forbidden' }));
      }
      const body = await getBody();
      const result = await borrowedBooksService.borrowBook(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    // POST /borrowedBooks/borrowed/returnBook - Return specific book
    if (url === '/borrowedBooks/borrowed/returnBook' && method === 'POST') {
      const body = await getBody();
      const result = await borrowedBooksService.removeBorrowedBookByDelete(
        body.email,
        body.bookId,
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    // GET /borrowedBooks/borrowed/count
    if (url === '/borrowedBooks/borrowed/count' && method === 'GET') {
      const count = await borrowedBooksService.count();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ count }));
    }

    // GET /borrowedBooks/borrowed - get all borrowed books for user
    if (url === '/borrowedBooks/borrowed' && method === 'GET') {
      const authHeader = req.headers['authorization'] as string;
      if (!authHeader) throw new Error('Authorization header missing');

      const token = authHeader.replace('Bearer ', '');
      const userEmail = extractEmailFromToken(token);

      const borrowed = await borrowedBooksService.getAllBorrowedBooks(userEmail);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(borrowed));
    }

    // PATCH /borrowedBooks/borrowed/:id - Return a borrowed book
    if (url?.startsWith('/borrowedBooks/borrowed/') && method === 'PATCH') {
      const id = url.split('/').pop()!;
      const result = await borrowedBooksService.returnBook(id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    // DELETE /borrowedBooks/borrowed - Return all books (public route)
    if (url === '/borrowedBooks/borrowed' && method === 'DELETE') {
      const authHeader = req.headers['authorization'] as string;
      const token = authHeader.replace('Bearer ', '');
      const userEmail = extractEmailFromToken(token);

      const result = await borrowedBooksService.returnAllBooks(userEmail);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    // 404 fallback
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Route not found' }));
  } catch (err: any) {
    console.error('BorrowedBooks route error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: err.message || 'Internal Server Error' }));
  }
}
