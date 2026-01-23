import express from 'express';
import { getDashboardStats, getRevenueStats, getServiceStats, getCategoryStats, getStylistStats } from '../controllers/reportsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// All reports routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/revenue', getRevenueStats);
router.get('/services', getServiceStats);
router.get('/categories', getCategoryStats);
router.get('/stylists', getStylistStats);

export default router;
