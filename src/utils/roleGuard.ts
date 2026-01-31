// utils/roleGuard.ts
import { ServerResponse } from 'http';
import { User, Role } from '../models/User.model';

export async function roleGuard(
  userId: string,
  requiredRoles: Role[],
  res: ServerResponse
): Promise<boolean> {
  const user = await User.findById(userId);

  if (!user) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
    return false;
  }

  if (!requiredRoles.includes(user.role)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Insufficient permissions' }));
    return false;
  }

  return true;
}

