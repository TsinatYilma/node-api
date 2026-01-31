import { IncomingMessage, ServerResponse } from 'http';
import * as membersService from '../services/members.service';
import { parseBody } from '../utils/helpers';

export default async function handleMembers(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    // POST /members
    if (req.method === 'POST' && req.url === '/members') {
      const body = await parseBody(req);
      const member = await membersService.create(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(member));
    }

    // GET /members/count
    if (req.method === 'GET' && req.url === '/members/count') {
      const count = await membersService.count();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ count }));
    }

    // GET /members/all
    if (req.method === 'GET' && req.url === '/members/all') {
      const members = await membersService.findAll();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(members));
    }

    // DELETE /members/:id
    if (req.method === 'DELETE' && req.url?.startsWith('/members/')) {
      const id = req.url.split('/')[2];
      const result = await membersService.removeMember(id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

  } catch (err: any) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: err.message }));
  }
}
