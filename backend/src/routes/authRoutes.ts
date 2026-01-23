import express from 'express';
import { register, login, getMe, createStylist } from '../controllers/authController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/stylists', protect, authorize('admin'), createStylist);

export default router;
