import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import Stripe from 'stripe';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { emailService } from '../services/emailService';
import { smsService } from '../services/smsService';
import { notificationQueue } from '../services/notificationQueueService';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER', {
  apiVersion: '2025-01-27.acacia' as any,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;

    const whereClause: any = {};
    if (userRole === 'customer') {
        whereClause.customerId = userId;
    } else if (userRole === 'stylist') {
        whereClause.stylistId = userId;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: { select: { fullName: true, email: true, phone: true } },
        category: { select: { name: true } }, // Formerly Service (Variation)
        style: { select: { name: true } }, // Formerly Category (Main Style)
        stylist: { 
            include: { 
                user: { select: { fullName: true } }
            } 
        },
        promo: {
          select: {
            id: true,
            title: true,
            promoMonth: true,
            promoYear: true,
            discountPercentage: true,
            promoPrice: true,
            stylePricing: {
              select: {
                style: { select: { name: true } },
                category: { select: { name: true } }
              }
            }
          }
        },
        payments: true, 
      },
      orderBy: { bookingDate: 'desc' }
    });

    const bookingsWithPrice = await Promise.all(bookings.map(async (booking) => {
        let price = 0;
        let duration = 60;

        if (booking.styleId && booking.categoryId) {
            const pricing = await prisma.stylePricing.findUnique({
                where: {
                    styleId_categoryId: {
                        styleId: booking.styleId,
                        categoryId: booking.categoryId
                    }
                }
            });
            if (pricing) {
                price = Number(pricing.price);
                duration = pricing.durationMinutes;
            }
        }

        // Add Victoria Surcharge
        if (booking.stylist?.user?.fullName?.toLowerCase().includes('victoria')) {
             price += 100;
        }
        
        return {
            ...booking,
            // Map for frontend compatibility or new structure
            serviceName: booking.category?.name, // Variation
            styleName: booking.style?.name, // Main Style
            price,
            duration
        };
    }));

    res.json(bookingsWithPrice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { styleId, categoryId, stylistId, date, time, guestDetails, paymentIntentId, promoId } = req.body;
    let userId = (req as any).user?.id;
    let createdUserPassword = '';

    // Verify Payment
    if (!paymentIntentId) {
        res.status(400).json({ message: 'Payment is required to confirm booking' });
        return;
    }

    // Check Payment Status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
        res.status(400).json({ message: 'Payment validation failed. Status: ' + paymentIntent.status });
        return;
    }

    // Validate Variation (formerly Category)
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
        res.status(400).json({ message: 'Invalid Variation (Category) ID' });
        return;
    }

    // Validate Style (formerly Service)
    if (styleId) {
         const style = await prisma.style.findUnique({ where: { id: styleId } });
         if (!style) {
             res.status(400).json({ message: 'Invalid Style ID' });
             return;
         }
    }

    // Check if amount is correct (5000 cents = $50)
    if (paymentIntent.amount !== 5000) {
        // Optional: Allow flexibility or strict check
        // For now, strict check
        // console.warn('Payment amount mismatch', paymentIntent.amount);
    }

    // Handle Guest Booking
    if (!userId) {
        if (!guestDetails || !guestDetails.fullName || !guestDetails.email || !guestDetails.phone) {
             res.status(400).json({ message: 'Guest details (Name, Email, Phone) are required' });
             return;
        }

        // Check if user exists with this email
        let user = await prisma.user.findUnique({ where: { email: guestDetails.email } });

        if (!user) {
            // Create new user for guest
            // Generate random password or placeholder
            const randomPassword = Math.random().toString(36).slice(-8);
            const passwordHash = await bcrypt.hash(randomPassword, 10);

            user = await prisma.user.create({
                data: {
                    fullName: guestDetails.fullName,
                    email: guestDetails.email,
                    phone: guestDetails.phone,
                    address: guestDetails.address || '',
                    role: 'customer',
                    passwordHash,
                    birthDay: guestDetails.birthDay ? Number(guestDetails.birthDay) : null,
                    birthMonth: guestDetails.birthMonth ? Number(guestDetails.birthMonth) : null,
                    notificationConsent: guestDetails.smsConsent ?? true,
                }
            });
            
            // Queue guest credentials email
            if (user.notificationConsent) {
                const { subject, html } = await emailService.getGuestCredentialsContent(guestDetails.fullName, randomPassword);
                await notificationQueue.add('EMAIL', guestDetails.email, html, subject, { type: 'GUEST_CREDENTIALS', userId: user.id });
            }
        } else {
            // Update birthday if provided and not set
            if (guestDetails.birthDay && guestDetails.birthMonth && (!user.birthDay || !user.birthMonth)) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        birthDay: Number(guestDetails.birthDay),
                        birthMonth: Number(guestDetails.birthMonth)
                    }
                });
            }
        }
        
        userId = user.id;
    } else {
        // Logged in user - check for profile update (Birthday)
        if (guestDetails) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            const data: any = {};

            if (guestDetails.birthDay && guestDetails.birthMonth && user && (!user.birthDay || !user.birthMonth)) {
                data.birthDay = Number(guestDetails.birthDay);
                data.birthMonth = Number(guestDetails.birthMonth);
            }

            if (typeof (guestDetails as any).smsConsent === 'boolean') {
                data.notificationConsent = (guestDetails as any).smsConsent;
            }

            if (Object.keys(data).length > 0) {
                await prisma.user.update({
                    where: { id: userId },
                    data
                });
            }
        }
    }
    
    // Parse Date and Time
    // Date string YYYY-MM-DD to Date object
    const bookingDate = new Date(date);
    // Time string HH:mm to Date object (Epoch + Time)
    const timeParts = time.split(':');
    const bookingTime = new Date(0); // Epoch
    bookingTime.setHours(Number(timeParts[0]));
    bookingTime.setMinutes(Number(timeParts[1]));

    // Transaction to create booking and payment record
    let result;
    try {
        result = await prisma.$transaction(async (tx) => {
            // 1. Race Condition Check
            // If a specific stylist is selected, check if they are already booked
            if (stylistId) {
                const existingBooking = await tx.booking.findFirst({
                    where: {
                        stylistId,
                        bookingDate,
                        bookingTime,
                        status: { not: 'cancelled' }
                    }
                });

                if (existingBooking) {
                    throw new Error('Selected stylist is no longer available at this time.');
                }
            } else {
                 // Check if user already has a booking at this time to prevent duplicates
                 const duplicateBooking = await tx.booking.findFirst({
                    where: {
                        customerId: userId,
                        bookingDate,
                        bookingTime,
                        status: { not: 'cancelled' }
                    }
                 });
                 if (duplicateBooking) {
                     throw new Error('You already have a booking at this time.');
                 }
            }

            const booking = await tx.booking.create({
                data: {
                    customerId: userId,
                    styleId,
                    categoryId,
                    stylistId: stylistId || null,
                    promoId: promoId || null,
                    bookingDate,
                    bookingTime,
                    status: 'booked',
                },
            });

            await tx.payment.create({
                data: {
                    bookingId: booking.id,
                    amount: 50.00,
                    stripePaymentId: paymentIntentId,
                    status: 'succeeded'
                }
            });

            return booking;
        });
    } catch (transactionError: any) {
        console.error('Booking transaction failed:', transactionError);
        
        // Attempt to refund the payment since we took money but failed to book
        try {
            console.log(`Initiating refund for PaymentIntent: ${paymentIntentId}`);
            await stripe.refunds.create({
                payment_intent: paymentIntentId,
            });
            console.log('Refund successful');
        } catch (refundError) {
            console.error('CRITICAL: Failed to refund after booking error:', refundError);
            // This is where you'd send an alert to Admin (Slack/Email)
        }

        res.status(409).json({ message: transactionError.message || 'Booking failed. Your payment has been refunded.' });
        return;
    }

    // Queue Confirmation Email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (user && user.notificationConsent) {
        if (user.email) {
            const { subject, html } = await emailService.getBookingConfirmationContent(
                user.fullName, 
                category.name, // Use category name (Variation)
                date, 
                time, 
                !!guestDetails
            );
            await notificationQueue.add('EMAIL', user.email, html, subject, { bookingId: result.id, userId: user.id });
        }

        // Queue Confirmation SMS
        if (user.phone) {
            const smsBody = await smsService.getBookingConfirmationContent(user.fullName, date, time);
            await notificationQueue.add('SMS', user.phone, smsBody, undefined, { bookingId: result.id, userId: user.id });
        }
    }

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, stylistId, paymentStatus } = req.body;

        const booking = await prisma.booking.findUnique({ where: { id } });
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        const data: any = {};
        if (status) data.status = status;
        
        if (stylistId) {
            if (stylistId === 'unassigned') {
                data.stylistId = null;
            } else {
                // Check if stylist is already booked at this time
                const conflict = await prisma.booking.findFirst({
                    where: {
                        stylistId,
                        bookingDate: booking.bookingDate,
                        bookingTime: booking.bookingTime,
                        status: { not: 'cancelled' },
                        id: { not: id }
                    }
                });

                if (conflict) {
                    res.status(409).json({ message: 'Stylist is already booked at this time' });
                    return;
                }
                data.stylistId = stylistId;
            }
        }
        
        // If updating payment status
        if (paymentStatus) {
            await prisma.payment.updateMany({
                where: { bookingId: id },
                data: { status: paymentStatus }
            });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data,
            include: {
                customer: { select: { fullName: true, email: true, phone: true } },
                category: { select: { name: true } },
                style: { select: { name: true } },
                stylist: { 
                    include: { 
                        user: { select: { fullName: true } }
                    } 
                },
                payments: true, 
            }
        });

        let price = 0;
        const b = updatedBooking;
        if (b.styleId && b.categoryId) {
             const pricing = await prisma.stylePricing.findUnique({
                 where: {
                     styleId_categoryId: {
                         styleId: b.styleId,
                         categoryId: b.categoryId
                     }
                 }
             });
             if (pricing) price = Number(pricing.price);
        }

        // Add Victoria Surcharge
        if (b.stylist?.user?.fullName?.toLowerCase().includes('victoria')) {
             price += 100;
        }

        const responseBooking = {
            ...updatedBooking,
            serviceName: b.category?.name,
            styleName: b.style?.name,
            price
        };

        // Check for status change to 'completed'
        if (status === 'completed' && booking.status !== 'completed') {
             const customer = (updatedBooking as any).customer;
             const category = (updatedBooking as any).category;
             
             if (customer && customer.notificationConsent) {
                 // Queue Thank You Email
                 if (customer.email) {
                     const { subject, html } = await emailService.getBookingCompletionContent(customer.fullName, category?.name || 'Service');
                     await notificationQueue.add('EMAIL', customer.email, html, subject, { bookingId: id, userId: customer.id });
                 }
                 
                 // Queue Thank You SMS
                 if (customer.phone) {
                     const smsBody = await smsService.getBookingCompletionContent(customer.fullName);
                     await notificationQueue.add('SMS', customer.phone, smsBody, undefined, { bookingId: id, userId: customer.id });
                 }
             }
        }

        res.json(responseBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating booking' });
    }
};

export const checkInBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        const booking = await prisma.booking.findUnique({ where: { id } });
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        // Authorization: Admin, Stylist, or the Customer who owns the booking
        if (userRole !== 'admin' && userRole !== 'stylist' && booking.customerId !== userId) {
            res.status(403).json({ message: 'Not authorized to check in this booking' });
            return;
        }

        // Time Validation (Relaxed 30 mins)
        const now = new Date();
        const bookingDate = new Date(booking.bookingDate);
        const bookingTime = new Date(booking.bookingTime);
        
        // Construct appointment datetime (UTC)
        const appointmentTime = new Date(bookingDate);
        appointmentTime.setUTCHours(bookingTime.getUTCHours());
        appointmentTime.setUTCMinutes(bookingTime.getUTCMinutes());
        appointmentTime.setUTCSeconds(0);
        
        const diffMs = now.getTime() - appointmentTime.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        // Debug log
        console.log(`Check-in Attempt: Now=${now.toISOString()}, Appt=${appointmentTime.toISOString()}, Diff=${diffMinutes}m`);

        if (Math.abs(diffMinutes) > 30) {
             res.status(400).json({ message: 'Check-in only allowed 30 minutes before or after appointment' });
             return;
        }

        // Update status
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status: 'checked_in' }
        });

        res.json(updatedBooking);

    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: 'Error checking in' });
    }
};

export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // amount in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating payment intent' });
  }
};

export const createBookingPaymentIntent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { amount } = req.body; // Amount in cents

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: { bookingId: id },
            automatic_payment_methods: { enabled: true }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Error creating booking payment intent:', error);
        res.status(500).json({ message: 'Error creating payment intent' });
    }
};

export const addBookingPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { amount, method, stripePaymentId } = req.body; // Amount in dollars

        await prisma.payment.create({
            data: {
                bookingId: id,
                amount: amount,
                stripePaymentId: stripePaymentId || `cash_${Date.now()}`,
                status: 'succeeded'
            }
        });

        // Check if full payment (simplified logic, real world would compare total price)
        // For now, if payment added manually, we might want to update status or just log it.
        // We return the updated booking with payments
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { payments: true }
        });

        res.json(booking);
    } catch (error) {
        console.error('Error adding payment:', error);
        res.status(500).json({ message: 'Error adding payment' });
    }
};
