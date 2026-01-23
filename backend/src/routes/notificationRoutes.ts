import express from 'express';
import { processNotifications, getUserNotifications } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/process', processNotifications);
router.get('/my-notifications', authenticateToken, getUserNotifications);

export default router;
