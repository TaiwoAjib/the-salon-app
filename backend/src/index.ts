import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import stylesRoutes from './routes/stylesRoutes';
import categoryRoutes from './routes/categoryRoutes';
import bookingRoutes from './routes/bookingRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import stylistRoutes from './routes/stylistRoutes';
import userRoutes from './routes/userRoutes';
import settingsRoutes from './routes/settingsRoutes';
import reportsRoutes from './routes/reportsRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import notificationRoutes from './routes/notificationRoutes';
import notificationSettingsRoutes from './routes/notificationSettingsRoutes';
import birthdayRoutes from './routes/birthdayRoutes';
import faqRoutes from './routes/faqRoutes';
import bookingPolicyRoutes from './routes/bookingPolicyRoutes';
import galleryRoutes from './routes/galleryRoutes';
import promoRoutes from './routes/promoRoutes';
import cron from 'node-cron';
import { reminderService } from './services/reminderService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Disable ETag to prevent 304 Not Modified responses
app.set('etag', false);

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/styles', stylesRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/stylists', stylistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/birthdays', birthdayRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/booking-policy', bookingPolicyRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/notification-settings', notificationSettingsRoutes);

app.get('/', (req, res) => {
  res.send('Victoria Salon API is running');
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Schedule Reminder Job (Every hour at minute 0)
  cron.schedule('0 * * * *', () => {
    console.log('Running scheduled reminder check...');
    reminderService.checkAndSendReminders();
  });
  
  // Initial check on startup (Optional, for testing)
  // reminderService.checkAndSendReminders();
});
