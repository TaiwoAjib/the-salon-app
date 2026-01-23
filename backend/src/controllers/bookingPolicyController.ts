import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getBookingPolicy = async (req: Request, res: Response) => {
  try {
    const policy = await prisma.bookingPolicy.findFirst({
      where: { isActive: true },
    });
    res.json(policy);
  } catch (error) {
    console.error('Error fetching booking policy:', error);
    res.status(500).json({ error: 'Failed to fetch booking policy' });
  }
};

export const updateBookingPolicy = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Update the first active policy or create one if none exists
    const existingPolicy = await prisma.bookingPolicy.findFirst();

    if (existingPolicy) {
      const updatedPolicy = await prisma.bookingPolicy.update({
        where: { id: existingPolicy.id },
        data: { content },
      });
      res.json(updatedPolicy);
    } else {
      const newPolicy = await prisma.bookingPolicy.create({
        data: { content, isActive: true },
      });
      res.json(newPolicy);
    }
  } catch (error) {
    console.error('Error updating booking policy:', error);
    res.status(500).json({ error: 'Failed to update booking policy' });
  }
};
