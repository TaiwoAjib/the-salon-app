import { Request, Response } from 'express';
import fs from 'fs';
import cloudinary from '../utils/cloudinary';
import prisma from '../utils/prisma';

const DEFAULT_BUSINESS_HOURS = {
  monday: { start: "09:00", end: "22:00", isOpen: true },
  tuesday: { start: "09:00", end: "22:00", isOpen: true },
  wednesday: { start: "09:00", end: "22:00", isOpen: true },
  thursday: { start: "09:00", end: "22:00", isOpen: true },
  friday: { start: "09:00", end: "22:00", isOpen: true },
  saturday: { start: "09:00", end: "22:00", isOpen: true },
  sunday: { start: "09:00", end: "22:00", isOpen: true },
};

export const uploadLogo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'salon-settings',
    });

    // Delete local file
    fs.unlinkSync(req.file.path);

    // Update DB
    const settings = await prisma.salonSettings.findFirst();
    if (settings) {
      const updated = await prisma.salonSettings.update({
        where: { id: settings.id },
        data: { logoUrl: result.secure_url },
      });
      res.json({ logoUrl: updated.logoUrl });
    } else {
      // Create new if not exists (fallback)
      const newSettings = await prisma.salonSettings.create({
        data: {
          logoUrl: result.secure_url,
          // Defaults for required fields will be used if defined in schema or these:
          salonName: 'Victoria Braids & Weaves',
          address: 'Default Address',
          phone: '000-000-0000',
          email: 'admin@example.com'
        },
      });
      res.json({ logoUrl: newSettings.logoUrl });
    }
  } catch (error) {
    console.error('Error uploading logo:', error);
    // Clean up file if error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error uploading logo' });
  }
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.salonSettings.findFirst();
    if (!settings) {
      // Should ideally be seeded, but create default if missing
      const newSettings = await prisma.salonSettings.create({
        data: {
          salonName: 'Victoria Braids & Weaves',
          address: 'Salon Address, City, State',
          phone: '+1 234 567 890',
          email: 'admin@victoriabraids.com',
          depositAmount: 50.00,
          notificationsEnabled: true,
          businessHours: DEFAULT_BUSINESS_HOURS,
        },
      });
      return res.json(newSettings);
    }
    
    // Ensure businessHours is present
    if (!settings.businessHours) {
        settings.businessHours = DEFAULT_BUSINESS_HOURS;
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { salonName, address, phone, email, depositAmount, notificationsEnabled, requireApproval, showFaqSection, businessHours, courtesyNotice } = req.body;
    
    const settings = await prisma.salonSettings.findFirst();
    
    if (settings) {
      const updated = await prisma.salonSettings.update({
        where: { id: settings.id },
        data: {
          salonName,
          address,
          phone,
          email,
          depositAmount: depositAmount ? parseFloat(depositAmount) : undefined,
          notificationsEnabled,
          requireApproval,
          showFaqSection,
          businessHours: businessHours || undefined,
          courtesyNotice,
        },
      });
      res.json(updated);
    } else {
      const newSettings = await prisma.salonSettings.create({
        data: {
          salonName,
          address,
          phone,
          email,
          depositAmount: depositAmount ? parseFloat(depositAmount) : 50.00,
          notificationsEnabled: notificationsEnabled ?? true,
          requireApproval: requireApproval ?? true,
          showFaqSection: showFaqSection ?? true,
          businessHours: businessHours || DEFAULT_BUSINESS_HOURS,
          courtesyNotice,
        },
      });
      res.json(newSettings);
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
};
