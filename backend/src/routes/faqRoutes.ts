import express from 'express';
import { 
  getPublicFaqs, 
  getAllFaqs, 
  createFaq, 
  updateFaq, 
  deleteFaq,
  reorderFaqs
} from '../controllers/faqController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public route
router.get('/public', getPublicFaqs);

// Admin routes
router.get('/', protect, authorize('admin'), getAllFaqs);
router.post('/', protect, authorize('admin'), createFaq);
router.put('/reorder', protect, authorize('admin'), reorderFaqs);
router.put('/:id', protect, authorize('admin'), updateFaq);
router.delete('/:id', protect, authorize('admin'), deleteFaq);

export default router;
