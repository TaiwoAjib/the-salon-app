
import { Router } from 'express';
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController';
import { protect, authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// Public routes
router.get('/', getGalleryItems);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('image'), createGalleryItem);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateGalleryItem);
router.delete('/:id', protect, authorize('admin'), deleteGalleryItem);

export default router;
