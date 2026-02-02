import { IncomingMessage, ServerResponse } from 'http';
import { BooksService } from '../services/books.service';
import { parseBody } from '../utils/helpers';
import { Role } from '../Role/role';
import { verifyToken } from '../Role/auth.jwt';

const booksService = new BooksService();

// Role check helper
function checkRole(req: IncomingMessage, roles: Role[]): boolean {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  return roles.includes(payload.role);
}

// Controller / route handler
export default async function handleBooks(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const url = req.url || '';
    const method = req.method || '';

    if (method === 'GET' && url === '/books') {
      const books = await booksService.getAllBooks();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(books));
    }

    if (method === 'GET' && url === '/books/count') {
      const count = await booksService.count();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ count }));
    }

    if (method === 'POST' && url === '/books/addBook') {
      if (checkRole(req, [Role.LIBRARY_ADMIN])) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Forbidden' }));
      }
      const body = await parseBody(req);
      const newBook = await booksService.addBook(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(newBook));
    }

    if (method === 'PATCH' && url?.startsWith('/books/')) {
      if (!checkRole(req, [Role.LIBRARY_ADMIN])) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Forbidden' }));
      }
      const id = url.split('/')[2];
      const body = await parseBody(req);
      const updated = await booksService.updateQuantity(id, body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(updated));
    }

    if (method === 'DELETE' && url?.startsWith('/books/')) {
      if (!checkRole(req, [Role.LIBRARY_ADMIN])) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Forbidden' }));
      }
      const id = url.split('/')[2];
      const deleted = await booksService.removeBook(id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(deleted));
    }

    // 404 fallback
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Route not found' }));
  } catch (err) {
    console.error('Books handler error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
}
