import { Router } from 'express';
import { logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/logout', authMiddleware, logout);

export default router;
