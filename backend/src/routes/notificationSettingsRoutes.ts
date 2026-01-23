import express from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { 
  getTemplates, 
  updateTemplate, 
  getNotificationHistory,
  getPendingApprovals,
  approveNotification,
  rejectNotification,
  updatePendingNotification
} from '../controllers/notificationSettingsController';

const router = express.Router();

router.get('/templates', authenticateToken, authorize('admin'), getTemplates);
router.put('/templates/:id', authenticateToken, authorize('admin'), updateTemplate);
router.get('/history', authenticateToken, authorize('admin'), getNotificationHistory);

// Approval workflow routes
router.get('/pending', authenticateToken, authorize('admin'), getPendingApprovals);
router.post('/pending/:id/approve', authenticateToken, authorize('admin'), approveNotification);
router.post('/pending/:id/reject', authenticateToken, authorize('admin'), rejectNotification);
router.put('/pending/:id', authenticateToken, authorize('admin'), updatePendingNotification);

export default router;
