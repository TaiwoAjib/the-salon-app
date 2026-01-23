import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Get all templates
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates', error });
  }
};

// Update a template
export const updateTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { subject, content, isActive } = req.body;

  try {
    const template = await prisma.notificationTemplate.update({
      where: { id },
      data: {
        subject,
        content,
        isActive
      }
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error updating template', error });
  }
};

// Get notification history
export const getNotificationHistory = async (req: Request, res: Response) => {
  try {
    const history = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 for now
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notification history', error });
  }
};

// Get notifications waiting for approval
export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { status: 'WAITING_APPROVAL' as any },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending approvals', error });
  }
};

// Approve a notification (move to PENDING queue)
export const approveNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { status: 'PENDING' }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error approving notification', error });
  }
};

// Reject a notification
export const rejectNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { status: 'REJECTED' as any }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting notification', error });
  }
};

// Update a pending notification
export const updatePendingNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { subject, content } = req.body;
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { subject, content }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error });
  }
};
