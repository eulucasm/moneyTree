import { Router } from 'express';
import { getAllUsers, updateUserPlan, toggleSuspension, deleteUser } from '../controllers/admin.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', getAllUsers);
router.put('/users/:userId/plan', updateUserPlan);
router.put('/users/:userId/suspension', toggleSuspension);
router.delete('/users/:userId', deleteUser);

export default router;
