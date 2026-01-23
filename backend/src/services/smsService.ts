import twilio from 'twilio';
import prisma from '../utils/prisma';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && accountSid.startsWith('AC') && authToken) ? twilio(accountSid, authToken) : null;

// Helper to replace variables
const replaceVariables = (content: string, variables: Record<string, any>) => {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value || ''));
  }
  return result;
};

export const smsService = {
  /**
   * Send a generic SMS
   */
  sendSms: async (to: string, body: string) => {
    try {
        if (!client || !fromNumber) {
            console.log('---------------------------------------------------');
            console.log(`[Mock SMS Service] To: ${to}`);
            console.log(`Body: ${body}`);
            console.log('---------------------------------------------------');
            return;
        }

        await client.messages.create({
            body,
            from: fromNumber,
            to
        });
        console.log(`SMS sent to ${to}`);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
  },

  /**
   * Get content for booking confirmation SMS
   */
  getBookingConfirmationContent: async (name: string, date: string, time: string) => {
      try {
        const template = await prisma.notificationTemplate.findUnique({
          where: { name: 'booking_confirmation_sms' }
        });

        if (template && template.isActive) {
          return replaceVariables(template.content, { name, date, time });
        }
      } catch (e) {
        console.warn('Failed to fetch template booking_confirmation_sms', e);
      }

      return `Hi ${name}, your appointment at Victoria Braids is confirmed for ${date} at ${time}. See you soon!`;
  },

  /**
   * Get content for booking reminder SMS
   */
  getBookingReminderContent: async (name: string, date: string, time: string) => {
      try {
        const template = await prisma.notificationTemplate.findUnique({
          where: { name: 'booking_reminder_sms' }
        });

        if (template && template.isActive) {
          return replaceVariables(template.content, { name, date, time });
        }
      } catch (e) {
        console.warn('Failed to fetch template booking_reminder_sms', e);
      }

      return `Hi ${name}, reminder: You have an appointment at Victoria Braids tomorrow (${date}) at ${time}.`;
  },
  
  /**
   * Get content for booking completion/thank you SMS
   */
  getBookingCompletionContent: async (name: string) => {
      try {
        const template = await prisma.notificationTemplate.findUnique({
          where: { name: 'booking_completion_sms' }
        });

        if (template && template.isActive) {
          return replaceVariables(template.content, { name });
        }
      } catch (e) {
        console.warn('Failed to fetch template booking_completion_sms', e);
      }

      return `Hi ${name}, thanks for visiting Victoria Braids! We hope you love your new look.`;
  },

  /**
   * Get content for birthday greeting SMS
   */
  getBirthdayGreetingContent: async (name: string) => {
      try {
        const template = await prisma.notificationTemplate.findUnique({
          where: { name: 'birthday_greeting_sms' }
        });

        if (template && template.isActive) {
          return replaceVariables(template.content, { name });
        }
      } catch (e) {
        console.warn('Failed to fetch template birthday_greeting_sms', e);
      }

      return `Happy Birthday ${name}! 🎉 Wishing you a wonderful day from everyone at Victoria Braids!`;
  }
};
