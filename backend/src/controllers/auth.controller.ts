import { Response } from 'express';
import { admin, firebaseAdminReady } from '../config/firebase';
import { sendServerError } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  try {
    if (firebaseAdminReady) {
      await (admin as any).auth().revokeRefreshTokens(userId);
      console.log(`[Auth] Revoked tokens for user: ${userId}`);
    }
    return res.json({ success: true, message: 'Tokens revoked successfully.' });
  } catch (err: any) {
    return sendServerError(res, '[Auth] Error revoking user tokens', err);
  }
};
