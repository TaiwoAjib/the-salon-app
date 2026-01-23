import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Public: Get all active categories (formerly services)
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Admin: Get all categories (active and inactive)
export const getAllAdminCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.category.count({ where })
    ]);

    res.json({
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Public: Get single category
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
    });
    
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category' });
  }
};

// Admin: Create new category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    
    if (!name) {
        res.status(400).json({ message: 'Name is required' });
        return;
    }

    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category' });
  }
};

// Admin: Update category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: { name, isActive },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category' });
  }
};

// Admin: Delete category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id },
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
};
