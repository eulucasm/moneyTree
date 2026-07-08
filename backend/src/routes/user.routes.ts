import { Router } from 'express';
import { getProfile, updateProfile, deleteProfile } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { updateProfileSchema } from '../validators/user.schema';

const router = Router();

router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', validateRequest(updateProfileSchema), updateProfile);
router.delete('/profile', deleteProfile);

export default router;
