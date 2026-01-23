import express from 'express';
import { createBooking, getBookings, createPaymentIntent, updateBooking, addBookingPayment, createBookingPaymentIntent, checkInBooking } from '../controllers/bookingController';
import { authenticateToken, protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public: Guests can book (optional auth handled inside controller or via middleware)
// Using authenticateToken to populate req.user if token exists, but not blocking guests
router.post('/', authenticateToken, createBooking); 

// Payment Intent for Initial Booking
router.post('/create-payment-intent', createPaymentIntent);

// Protected: Only logged in users can view their bookings
// Use 'protect' which enforces auth
router.get('/', protect, getBookings);

// Protected: Check-in (Customer, Admin, Stylist)
router.post('/:id/check-in', protect, checkInBooking);

// Admin/Stylist: Update booking (Assign stylist, change status)
router.patch('/:id', protect, authorize('admin', 'stylist'), updateBooking);

// Admin/Stylist: Create Payment Intent for existing booking (Service Payment)
router.post('/:id/payment-intent', protect, authorize('admin', 'stylist'), createBookingPaymentIntent);

// Admin/Stylist: Add payment to booking (Confirm Payment)
router.post('/:id/payments', protect, authorize('admin', 'stylist'), addBookingPayment);

export default router;
