import { Router } from 'express';
import {
  getAllStyles,
  createStyle,
  updateStyle,
  deleteStyle,
  updateStylePricing,
  deleteStylePricing
} from '../controllers/stylesController';
import { protect, authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// Public routes
router.get('/', getAllStyles);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('image'), createStyle);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateStyle);
router.delete('/:id', protect, authorize('admin'), deleteStyle);
router.put('/:id/pricing', protect, authorize('admin'), updateStylePricing);
router.delete('/:id/pricing/:categoryId', protect, authorize('admin'), deleteStylePricing);

export default router;
