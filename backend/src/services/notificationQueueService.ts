import prisma from '../utils/prisma';
import { emailService } from './emailService';
import { smsService } from './smsService';
import { NotificationType } from '@prisma/client';

export const notificationQueue = {
  /**
   * Add a notification to the queue
   */
  add: async (
    type: 'EMAIL' | 'SMS',
    recipient: string,
    content: string,
    subject?: string,
    metadata?: any
  ) => {
    try {
      // Check if approval is required
      const settings = await prisma.salonSettings.findFirst();
      const requireApproval = settings?.requireApproval ?? true;
      const initialStatus = requireApproval ? 'WAITING_APPROVAL' : 'PENDING';

      await prisma.notification.create({
        data: {
          type: type as NotificationType,
          recipient,
          content,
          subject,
          metadata: metadata || {},
          status: initialStatus as any // Type cast until client is regenerated
        }
      });
      console.log(`[Queue] Added ${type} notification for ${recipient} (Status: ${initialStatus})`);
    } catch (error) {
      console.error('Error adding notification to queue:', error);
      // In a robust system, we might want to alert admins here
    }
  },

  /**
   * Process pending notifications
   */
  processQueue: async (limit = 20) => {
    // Fetch pending notifications
    const pending = await prisma.notification.findMany({
      where: {
        status: 'PENDING',
        retryCount: { lt: 3 }
      },
      take: limit,
      orderBy: { createdAt: 'asc' }
    });

    if (pending.length === 0) {
      return { processed: 0, errors: 0 };
    }

    console.log(`[Queue] Processing ${pending.length} notifications...`);
    let processedCount = 0;
    let errorCount = 0;

    for (const notification of pending) {
      try {
        if (notification.type === 'EMAIL') {
           if (!notification.subject) throw new Error('Email subject missing');
           await emailService.sendEmail(notification.recipient, notification.subject, notification.content);
        } else if (notification.type === 'SMS') {
           await smsService.sendSms(notification.recipient, notification.content);
        }

        // Mark as SENT
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        });
        processedCount++;

      } catch (error: any) {
        console.error(`[Queue] Failed to process notification ${notification.id}:`, error);
        errorCount++;
        
        // Increment retry count or mark FAILED
        const retryCount = notification.retryCount + 1;
        const status = retryCount >= 3 ? 'FAILED' : 'PENDING';
        
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            retryCount,
            status
          }
        });
      }
    }

    return { processed: processedCount, errors: errorCount };
  }
};
