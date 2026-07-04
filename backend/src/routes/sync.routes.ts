import { Router } from 'express';
import { syncGetData, syncPostData } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', syncGetData);
router.post('/', syncPostData);

export default router;
