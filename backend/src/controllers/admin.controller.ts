import { Response } from 'express';
import prisma from '../config/prisma';
import { sendServerError } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        city: true,
        state: true,
        loginType: true,
        activePlan: true,
        role: true,
        status: true,
        phone: true,
        birthDate: true,
        createdAt: true,
      }
    });

    const formatted = users.map((u: any) => ({
      id: u.id,
      userProfile: {
        firstName: u.firstName,
        lastName: u.lastName,
        city: u.city,
        state: u.state,
        loginType: u.loginType,
        activePlan: u.activePlan,
        role: u.role,
        status: u.status,
        phone: u.phone || '',
        birthDate: u.birthDate || '',
        createdAt: u.createdAt,
      }
    }));

    return res.json(formatted);
  } catch (err: any) {
    return sendServerError(res, '[Admin] Error fetching all users', err);
  }
};

export const updateUserPlan = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { activePlan } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: userId as string },
      data: { activePlan },
    });
    return res.json(updated);
  } catch (err: any) {
    return sendServerError(res, '[Admin] Error updating user plan', err);
  }
};

export const toggleSuspension = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: userId as string },
      data: { status },
    });
    return res.json(updated);
  } catch (err: any) {
    return sendServerError(res, '[Admin] Error toggling suspension', err);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  try {
    await prisma.user.delete({
      where: { id: userId as string },
    });
    return res.json({ success: true });
  } catch (err: any) {
    return sendServerError(res, '[Admin] Error deleting user', err);
  }
};
