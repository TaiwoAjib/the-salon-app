import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getPublicFaqs = async (req: Request, res: Response) => {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching public FAQs:', error);
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
};

export const getAllFaqs = async (req: Request, res: Response) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
};

export const createFaq = async (req: Request, res: Response) => {
  try {
    const { question, answer, order, isActive } = req.body;
    
    // Get max order if not provided
    let newOrder = order;
    if (newOrder === undefined) {
      const maxOrderFaq = await prisma.faq.findFirst({
        orderBy: { order: 'desc' }
      });
      newOrder = (maxOrderFaq?.order || 0) + 1;
    }

    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        order: newOrder,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.json(faq);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ message: 'Error creating FAQ' });
  }
};

export const updateFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, answer, order, isActive } = req.body;

    const faq = await prisma.faq.update({
      where: { id },
      data: {
        question,
        answer,
        order,
        isActive
      }
    });
    res.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ message: 'Error updating FAQ' });
  }
};

export const deleteFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.faq.delete({
      where: { id }
    });
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ message: 'Error deleting FAQ' });
  }
};

export const reorderFaqs = async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body; // Array of IDs in new order
    
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    // Use transaction to update all
    await prisma.$transaction(
      orderedIds.map((id, index) => 
        prisma.faq.update({
          where: { id },
          data: { order: index + 1 }
        })
      )
    );

    res.json({ message: 'FAQs reordered successfully' });
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    res.status(500).json({ message: 'Error reordering FAQs' });
  }
};
