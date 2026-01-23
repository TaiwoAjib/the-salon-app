import express from 'express';
import { 
    getAllStylists, 
    getStylistById, 
    createStylist, 
    updateStylist, 
    deleteStylist
} from '../controllers/stylistController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes for booking flow
router.get('/', getAllStylists);
router.get('/:id', getStylistById);

// Protected Admin-only routes
router.post('/', protect, authorize('admin'), createStylist);
router.put('/:id', protect, authorize('admin'), updateStylist);
router.delete('/:id', protect, authorize('admin'), deleteStylist);

export default router;
