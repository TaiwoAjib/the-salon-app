import { Router } from 'express';
import { getSettings, updateSettings, uploadLogo } from '../controllers/settingsController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// Public route for reading settings (at least deposit amount and salon info)
router.get('/', getSettings);

// Admin only route for updating
router.put('/', authenticateToken, authorize('admin'), updateSettings);

// Admin only route for uploading logo
router.post('/logo', authenticateToken, authorize('admin'), upload.single('logo'), uploadLogo);

export default router;
