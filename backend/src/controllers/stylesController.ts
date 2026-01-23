import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import fs from 'fs';
import cloudinary from '../utils/cloudinary';

// Admin: Get all styles (formerly categories)
export const getAllStyles = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [styles, total] = await Promise.all([
      prisma.style.findMany({
        where,
        include: {
          pricing: {
            include: {
              category: true
            }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.style.count({ where })
    ]);

    res.json({
      data: styles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching styles:', error);
    res.status(500).json({ message: 'Error fetching styles' });
  }
};

// Admin: Create style
export const createStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const existing = await prisma.style.findUnique({
      where: { name },
    });

    if (existing) {
      if (req.file) fs.unlinkSync(req.file.path); // Clean up if validation fails
      res.status(400).json({ message: 'Style already exists' });
      return;
    }

    let imageUrl = null;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
        fs.unlinkSync(req.file.path); // Clean up local file
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // Continue without image or fail? Let's continue without image but log error
      }
    }

    const style = await prisma.style.create({
      data: { name, imageUrl },
    });
    res.status(201).json(style);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Error creating style' });
  }
};

// Admin: Update style
export const updateStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    let imageUrl = undefined;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
      }
    }

    const data: any = { name };
    if (imageUrl) {
      data.imageUrl = imageUrl;
    }

    const style = await prisma.style.update({
      where: { id },
      data,
    });
    res.json(style);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Error updating style' });
  }
};

// Admin: Delete style
export const deleteStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.style.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting style' });
  }
};

// Admin: Update Style Pricing
export const updateStylePricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // styleId
    const { categoryId, price, durationMinutes } = req.body;

    if (!categoryId || !price) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const pricing = await prisma.stylePricing.upsert({
      where: {
        styleId_categoryId: {
            styleId: id,
            categoryId
        }
      },
      update: {
        price,
        durationMinutes: durationMinutes || 60
      },
      create: {
        styleId: id,
        categoryId,
        price,
        durationMinutes: durationMinutes || 60
      }
    });

    res.json(pricing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating style pricing' });
  }
};

// Admin: Get Style Pricing
export const getStylePricing = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const pricing = await prisma.stylePricing.findMany({
            where: { styleId: id },
            include: { category: true }
        });
        res.json(pricing);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pricing' });
    }
};

// Admin: Delete Style Pricing
export const deleteStylePricing = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, categoryId } = req.params; // id is styleId
        await prisma.stylePricing.delete({
            where: {
                styleId_categoryId: {
                    styleId: id,
                    categoryId
                }
            }
        });
        res.json({ message: 'Pricing removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing pricing' });
    }
};
