import express from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, updateProfile } from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

// Profile Routes (Authenticated User)
router.patch('/profile', protect, upload.single('profileImage'), updateProfile);

// Admin Routes (User Management)
router.get('/customers', protect, authorize('admin'), getCustomers);
router.post('/customers', protect, authorize('admin'), createCustomer);
router.patch('/customers/:id', protect, authorize('admin'), updateCustomer);
router.delete('/customers/:id', protect, authorize('admin'), deleteCustomer);

export default router;
