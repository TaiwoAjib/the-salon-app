import { Router } from 'express';
import {
  getActivePromos,
  getAllPromos,
  createPromo,
  deletePromo,
  togglePromoStatus,
} from '../controllers/promoController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getActivePromos);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllPromos);
router.post('/', protect, authorize('admin'), createPromo);
router.delete('/:id', protect, authorize('admin'), deletePromo);
router.patch('/:id/status', protect, authorize('admin'), togglePromoStatus);

export default router;
