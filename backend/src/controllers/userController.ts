import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import cloudinary from '../utils/cloudinary';
import fs from 'fs';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = { role: 'customer' };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          address: true,
          role: true,
          createdAt: true,
          profileImage: true,
          _count: {
            select: { bookings: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, address, password } = req.body;

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

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        address,
        passwordHash,
        role: 'customer',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        profileImage: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, address, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const data: any = {
      fullName,
      email,
      phone,
      address
    };

    if (password && password.trim() !== '') {
        data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        profileImage: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
};

// Update Profile (Self)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { fullName, email, phone, address, password, notificationConsent, birthDay, birthMonth } = req.body;
    let profileImageUrl = null;

    // Handle Image Upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'victoria-salon/profiles',
          use_filename: true,
        });
        profileImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
      } finally {
        // Remove file from local storage
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
      }
    }

    const data: any = {};
    if (fullName) data.fullName = fullName;
    if (email) data.email = email;
    if (phone) data.phone = phone;
    if (address) data.address = address;
    if (profileImageUrl) data.profileImage = profileImageUrl;
    
    // Handle birthDay and birthMonth
    if (birthDay) data.birthDay = parseInt(birthDay.toString());
    if (birthMonth) data.birthMonth = parseInt(birthMonth.toString());

    if (typeof notificationConsent !== 'undefined') {
      if (notificationConsent === true || notificationConsent === 'true') data.notificationConsent = true;
      if (notificationConsent === false || notificationConsent === 'false') data.notificationConsent = false;
    }

    if (password && password.trim() !== '') {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
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
        profileImage: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};
