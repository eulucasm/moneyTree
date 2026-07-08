import { Response } from 'express';
import { sendServerError } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as userService from '../services/user.service';
import * as syncService from '../services/sync.service';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  try {
    const profile = await userService.getUserProfile(userId);
    return res.json(profile);
  } catch (err: any) {
    return sendServerError(res, '[Profile] Error fetching/creating user profile', err);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  // Ignoring role and status from req.body to prevent privilege escalation
  const { firstName, lastName, city, state, loginType, activePlan, savingsGoal, language, phone, birthDate } = req.body;

  try {
    const user = await userService.updateUserProfile(userId, {
      firstName, lastName, city, state, loginType, activePlan, savingsGoal, language, phone, birthDate
    });
    return res.json(user);
  } catch (err: any) {
    return sendServerError(res, '[Profile] Error updating profile', err);
  }
};

export const deleteProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  try {
    await userService.deleteUserProfile(userId);
    return res.json({ success: true, message: 'User account wiped successfully.' });
  } catch (err: any) {
    return sendServerError(res, '[Profile] Error deleting account', err);
  }
};

export const syncGetData = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  try {
    const data = await syncService.getSyncData(userId);
    return res.json(data);
  } catch (err: any) {
    return sendServerError(res, '[Sync] Error pulling user data', err);
  }
};

export const syncPostData = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  try {
    const result = await syncService.postSyncData(userId, req.body);
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'EMPTY_OVERWRITE_BLOCKED') {
      return res.status(409).json({
        error: 'Empty state rejected — user has existing data in the database.',
        code: 'EMPTY_OVERWRITE_BLOCKED'
      });
    }
    return sendServerError(res, '[Sync] Error pushing user data', err);
  }
};
