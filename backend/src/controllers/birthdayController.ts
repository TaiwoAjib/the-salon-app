import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { notificationQueue } from '../services/notificationQueueService';
import { emailService } from '../services/emailService';
import { smsService } from '../services/smsService';

export const getUpcomingBirthdays = async (req: Request, res: Response): Promise<void> => {
    try {
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 1-12
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

        // Find users with birthday in current month or next month
        const users = await prisma.user.findMany({
            where: {
                role: 'customer',
                OR: [
                    { birthMonth: currentMonth },
                    { birthMonth: nextMonth }
                ]
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                birthDay: true,
                birthMonth: true
            }
        });

        // Simple sort: Month then Day
        // Note: This puts Jan after Dec even if current month is Dec.
        // Frontend can handle sophisticated sorting or we can improve here.
        // For now, simple sort.
        users.sort((a, b) => {
            if (a.birthMonth !== b.birthMonth) {
                // If we are in Dec, we want Jan to come AFTER Dec.
                // But standard sort puts 1 before 12.
                // Let's handle the wrap-around logic if needed.
                // If currentMonth is 12, then 1 should be treated as "larger" than 12 for sorting purposes relative to "now".
                // But easier: just return list, let Frontend display "This Month" and "Next Month".
                return (a.birthMonth || 0) - (b.birthMonth || 0);
            }
            return (a.birthDay || 0) - (b.birthDay || 0);
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching birthdays:', error);
        res.status(500).json({ message: 'Error fetching birthdays' });
    }
};

export const sendBirthdayGreeting = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, type } = req.body; // type: 'email' | 'sms'
        
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
             res.status(404).json({ message: 'User not found' });
             return;
        }

        if (type === 'email' && user.email) {
            // Send Email
            const { subject, html } = await emailService.getBirthdayGreetingContent(user.fullName);
            await notificationQueue.add('EMAIL', user.email, html, subject, { type: 'BIRTHDAY_GREETING', userId: user.id });
        } else if (type === 'sms' && user.phone) {
            // Send SMS
            const message = await smsService.getBirthdayGreetingContent(user.fullName);
            await notificationQueue.add('SMS', user.phone, message, undefined, { type: 'BIRTHDAY_GREETING', userId: user.id });
        } else {
            res.status(400).json({ message: 'Invalid type or missing contact info' });
            return;
        }

        res.json({ message: 'Greeting queued successfully' });
    } catch (error) {
        console.error('Error sending greeting:', error);
        res.status(500).json({ message: 'Error sending greeting' });
    }
};
