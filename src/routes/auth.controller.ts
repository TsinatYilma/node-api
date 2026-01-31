import { IncomingMessage, ServerResponse } from 'http';
import * as authService from '../services/authService.service';
import { authGuard } from '../utils/authGuard';
import { parse } from '../utils/otherhelper';
import { roleGuard } from '../utils/roleGuard';


export default async function handleAuth(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method === 'POST' && req.url === '/auth/signup') {
      const body = await parse(req);
      const result = await authService.signup(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    if (req.method === 'POST' && req.url === '/auth/login') {
      const body = await parse(req);
      const result = await authService.login(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }


    if (req.method === 'GET' && req.url === '/auth/allUsers') {
      const users = await authService.getAllUsers();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(users));
    }

    if (req.method === 'GET' && req.url === '/auth/count') {
      const count = await authService.countUsers();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ count }));
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));

  } catch (err: any) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: err.message }));
  }
}

