import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export interface AuthRequest extends Request {
  adminId?: string;
  userId?: string;
}

// Admin auth middleware
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId?: string };
    if (!decoded.adminId) { res.status(403).json({ success: false, message: 'Admin access required' }); return; }
    req.adminId = decoded.adminId;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// User auth middleware
export const userAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };
    if (!decoded.userId) { res.status(403).json({ success: false, message: 'User access required' }); return; }
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Optional user auth (doesn't fail if no token)
export const optionalUserAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; adminId?: string };
      req.userId = decoded.userId;
    } catch {}
  }
  next();
};
