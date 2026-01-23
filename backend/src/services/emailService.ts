import nodemailer from 'nodemailer';
import prisma from '../utils/prisma';

// Configure transporter
// Ideally, these credentials should be in .env
// For MVP/Dev, we can use a test account or console log if envs are missing
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail' or 'SendGrid'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper to replace variables
const replaceVariables = (content: string, variables: Record<string, any>) => {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value || ''));
  }
  return result;
};

export const emailService = {
  /**
   * Send a generic email
   */
  sendEmail: async (to: string, subject: string, html: string) => {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('---------------------------------------------------');
        console.log(`[Mock Email Service] To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${html}`);
        console.log('---------------------------------------------------');
        return;
      }

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Victoria Braids" <noreply@victoriabraids.com>',
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw, just log. We don't want to break the booking flow if email fails.
    }
  },

  /**
   * Get content for login credentials email
   */
  getGuestCredentialsContent: async (name: string, password: string) => {
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { name: 'guest_credentials_email' }
      });

      if (template && template.isActive) {
        return {
          subject: template.subject || 'Your Account Credentials - Victoria Braids & Weaves',
          html: replaceVariables(template.content, { name, email: '...', password })
        };
      }
    } catch (e) {
      console.warn('Failed to fetch template guest_credentials_email', e);
    }

    // Fallback
    const subject = 'Your Account Credentials - Victoria Braids & Weaves';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Victoria Braids & Weaves!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for booking with us. An account has been created for you to manage your bookings.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ...</p>
          <p style="margin: 10px 0 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p>You can log in to your dashboard to view your appointment details.</p>
        <p>Please pay the $50 booking fee upon arrival for your appointment.</p>
        <p>Best regards,<br>Victoria Braids Team</p>
      </div>
    `;
    return { subject, html };
  },

  /**
   * Get content for booking confirmation email
   */
  getBookingConfirmationContent: async (name: string, serviceName: string, date: string, time: string, isGuest: boolean) => {
    const templateName = isGuest ? 'booking_confirmation_email_guest' : 'booking_confirmation_email_user';
    
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { name: templateName }
      });

      if (template && template.isActive) {
        return {
          subject: template.subject || 'Appointment Confirmation - Victoria Braids & Weaves',
          html: replaceVariables(template.content, { name, serviceName, date, time })
        };
      }
    } catch (e) {
      console.warn(`Failed to fetch template ${templateName}`, e);
    }

    // Fallback
    const subject = 'Appointment Confirmation - Victoria Braids & Weaves';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Appointment Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>Your appointment for <strong>${serviceName}</strong> has been scheduled.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 10px 0 0;"><strong>Time:</strong> ${time}</p>
        </div>
        <p>Please remember to pay the <strong>$50 booking fee</strong> upon arrival to confirm your slot.</p>
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>Victoria Braids Team</p>
      </div>
    `;
    return { subject, html };
  },

  /**
   * Get content for booking reminder email
   */
  getBookingReminderContent: async (name: string, serviceName: string, date: string, time: string) => {
    const templateName = 'booking_reminder_email';
    
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { name: templateName }
      });

      if (template && template.isActive) {
        return {
          subject: template.subject || 'Appointment Reminder - Victoria Braids & Weaves',
          html: replaceVariables(template.content, { name, serviceName, date, time })
        };
      }
    } catch (e) {
      console.warn(`Failed to fetch template ${templateName}`, e);
    }

    // Fallback
    const subject = 'Appointment Reminder - Victoria Braids & Weaves';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Appointment Reminder</h2>
        <p>Hi ${name},</p>
        <p>This is a reminder that you have an appointment for <strong>${serviceName}</strong> coming up tomorrow.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 10px 0 0;"><strong>Time:</strong> ${time}</p>
        </div>
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>Victoria Braids Team</p>
      </div>
    `;
    return { subject, html };
  },

  /**
   * Get content for booking completion/thank you email
   */
  getBookingCompletionContent: async (name: string, serviceName: string) => {
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { name: 'booking_completion_email' }
      });

      if (template && template.isActive) {
        return {
          subject: template.subject || 'Thank You for Visiting Victoria Braids & Weaves',
          html: replaceVariables(template.content, { name, serviceName })
        };
      }
    } catch (e) {
      console.warn('Failed to fetch template booking_completion_email', e);
    }

    // Fallback
    const subject = 'Thank You for Visiting Victoria Braids & Weaves';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank You!</h2>
        <p>Hi ${name},</p>
        <p>It was a pleasure having you at the salon today for your <strong>${serviceName}</strong> service.</p>
        <p>We hope you love your new look! If you have any feedback or questions, please don't hesitate to reach out.</p>
        <p>We look forward to seeing you again soon.</p>
        <p>Best regards,<br>Victoria Braids Team</p>
      </div>
    `;
    return { subject, html };
  },

  /**
   * Get content for birthday greeting email
   */
  getBirthdayGreetingContent: async (name: string) => {
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { name: 'birthday_greeting_email' }
      });

      if (template && template.isActive) {
        return {
          subject: template.subject || 'Happy Birthday!',
          html: replaceVariables(template.content, { name })
        };
      }
    } catch (e) {
      console.warn('Failed to fetch template birthday_greeting_email', e);
    }

    // Fallback
    const subject = `Happy Birthday, ${name}!`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Happy Birthday! 🎉</h2>
            <p>Dear ${name},</p>
            <p>Wishing you a fantastic birthday filled with joy and beauty!</p>
            <p>From all of us at <strong>Victoria Braids & Weaves</strong>.</p>
        </div>
    `;
    return { subject, html };
  }
};
