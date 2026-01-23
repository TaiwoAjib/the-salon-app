import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';

// Admin: Get all stylists
export const getAllStylists = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.user = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const [stylists, total] = await Promise.all([
      prisma.stylist.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              address: true,
              role: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stylist.count({ where })
    ]);
    
    // Flatten the response for easier frontend consumption
    const formattedStylists = stylists.map(stylist => ({
      id: stylist.id,
      userId: stylist.userId,
      fullName: stylist.user.fullName,
      email: stylist.user.email,
      phone: stylist.user.phone,
      address: stylist.user.address,
      skillLevel: stylist.skillLevel,
      isActive: stylist.isActive,
      createdAt: stylist.createdAt
    }));

    res.json({
      data: formattedStylists,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stylists' });
  }
};

// Admin: Get single stylist
export const getStylistById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const stylist = await prisma.stylist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            address: true,
            role: true,
          }
        }
      }
    });
    
    if (!stylist) {
      res.status(404).json({ message: 'Stylist not found' });
      return;
    }

    res.json({
      id: stylist.id,
      userId: stylist.userId,
      fullName: stylist.user.fullName,
      email: stylist.user.email,
      phone: stylist.user.phone,
      address: stylist.user.address,
      skillLevel: stylist.skillLevel,
      isActive: stylist.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stylist' });
  }
};

// Admin: Create Stylist
export const createStylist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, address, password, skillLevel } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (prisma) => {
      // Create User
      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          phone,
          address,
          passwordHash,
          role: 'stylist',
        },
      });

      // Create Stylist Profile
      const stylist = await prisma.stylist.create({
        data: {
          userId: user.id,
          skillLevel: skillLevel || 'Intermediate',
        },
      });

      return { user, stylist };
    });

    res.status(201).json({
      message: 'Stylist created successfully',
      stylist: {
        id: result.stylist.id,
        userId: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        skillLevel: result.stylist.skillLevel
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update Stylist
export const updateStylist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, address, skillLevel, isActive } = req.body;

    const stylist = await prisma.stylist.findUnique({ where: { id } });
    if (!stylist) {
      res.status(404).json({ message: 'Stylist not found' });
      return;
    }

    // Update using transaction to handle both tables
    await prisma.$transaction(async (prisma) => {
      // Update User details
      await prisma.user.update({
        where: { id: stylist.userId },
        data: {
          fullName,
          email,
          phone,
          address
        }
      });

      // Update Stylist details
      await prisma.stylist.update({
        where: { id },
        data: {
          skillLevel,
          isActive
        }
      });
    });

    res.json({ message: 'Stylist updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stylist' });
  }
};

// Admin: Delete Stylist
export const deleteStylist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const stylist = await prisma.stylist.findUnique({ where: { id } });
    if (!stylist) {
      res.status(404).json({ message: 'Stylist not found' });
      return;
    }

    // Delete user (cascade will handle stylist profile)
    await prisma.user.delete({
      where: { id: stylist.userId }
    });

    res.json({ message: 'Stylist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting stylist' });
  }
};
