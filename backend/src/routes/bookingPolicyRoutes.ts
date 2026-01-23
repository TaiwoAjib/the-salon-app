import { Router } from 'express';
import { getBookingPolicy, updateBookingPolicy } from '../controllers/bookingPolicyController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Public route to get the policy
router.get('/', getBookingPolicy);

// Admin route to update the policy
router.put('/', protect, authorize('admin'), updateBookingPolicy);

export default router;
