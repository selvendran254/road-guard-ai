import { Request, Response, NextFunction } from 'express';
import { getSessionByToken } from '../store';
import { authoritySessions } from '../store';

export interface AuthRequest extends Request {
  session?: ReturnType<typeof getSessionByToken>;
  authority?: { username: string; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const session = getSessionByToken(token);
  if (!session || !session.otpVerified) {
    return res.status(401).json({ error: 'Invalid or unverified session' });
  }
  req.session = session;
  next();
}

export function requireAuthority(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authority authentication required' });
  }
  const auth = authoritySessions.get(token);
  if (!auth) {
    return res.status(401).json({ error: 'Invalid authority session' });
  }
  req.authority = { username: auth.username, role: auth.role };
  next();
}
