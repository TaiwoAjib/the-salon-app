import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

type AuthRequest = Request & {
  user?: {
    id: string;
    role: string;
  };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, address, password, role } = req.body;

    // Basic Validation
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

    // Default to customer if invalid role provided
    const userRole = ['admin', 'stylist', 'customer'].includes(role) ? role : 'customer';

    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          fullName,
          email,
          phone,
          address,
          passwordHash,
          role: userRole,
        },
      });

      if (userRole === 'stylist') {
        await tx.stylist.create({
          data: {
            userId: user.id,
            skillLevel: 'Intermediate',
          },
        });
      }

      return user;
    });

    const user = result;

    // Generate Token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({ 
        message: 'User created successfully', 
        token,
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

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

    // Create User as Stylist
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
    await prisma.stylist.create({
      data: {
        userId: user.id,
        skillLevel: skillLevel || 'Intermediate',
      },
    });

    res.status(201).json({ 
        message: 'Stylist created successfully', 
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            profileImage: user.profileImage
        }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Please provide email and password' });
        return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ 
        token, 
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            profileImage: user.profileImage,
            notificationConsent: user.notificationConsent,
            birthDay: user.birthDay,
            birthMonth: user.birthMonth
        }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
             res.status(401).json({ message: 'Not authenticated' });
             return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                address: true,
                role: true,
                notificationConsent: true,
                birthDay: true,
                birthMonth: true,
                createdAt: true,
                profileImage: true
            }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
