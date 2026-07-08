import { Request, Response, NextFunction } from 'express';
import { admin, firebaseAdminReady } from '../config/firebase';
import prisma from '../config/prisma';
import { sendServerError } from './error.middleware';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

const decodeJwtWithoutVerification = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1];
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('[Auth] Failed to decode JWT locally:', err);
    return null;
  }
};

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  const isDev = process.env.NODE_ENV !== 'production';
  if (token.startsWith('mock-uid-')) {
    if (!isDev) {
      return res.status(401).json({ error: 'Mock tokens are not allowed in production' });
    }
    req.userId = token.replace('mock-uid-', '');
    return next();
  }

  try {
    if (firebaseAdminReady) {
      const decodedToken = await (admin as any).auth().verifyIdToken(token, true);
      req.userId = decodedToken.uid;
      return next();
    }

    console.warn('[Auth] Firebase Admin not ready — using unverified JWT decode as fallback.');
    const decoded = decodeJwtWithoutVerification(token);
    if (decoded && (decoded.sub || decoded.user_id)) {
      req.userId = decoded.sub || decoded.user_id;
      return next();
    }
    return res.status(401).json({ error: 'Token decode failed — no uid found in payload' });
  } catch (err: any) {
    console.error('[Auth] Token verification failed:', err);
    return res.status(401).json({ error: 'Unauthorized/Invalid token', details: err.message || String(err) });
  }
};

export const adminMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.userId!;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  } catch (err) {
    return sendServerError(res, '[Admin] Internal error in admin verification', err);
  }
};
