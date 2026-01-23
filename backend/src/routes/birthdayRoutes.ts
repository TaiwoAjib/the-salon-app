import { Router } from 'express';
import { getUpcomingBirthdays, sendBirthdayGreeting } from '../controllers/birthdayController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Only admin should access birthday module
router.get('/upcoming', protect, authorize('admin'), getUpcomingBirthdays);
router.post('/greet', protect, authorize('admin'), sendBirthdayGreeting);

export default router;
