import { Router } from 'express';
import {
  getAllCategories, // This now refers to Variations
  getAllAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getAllCategories);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllAdminCategories);
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
