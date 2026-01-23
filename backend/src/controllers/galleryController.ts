
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import fs from 'fs';
import cloudinary from '../utils/cloudinary';

// Public: Get all gallery items
export const getGalleryItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ message: 'Error fetching gallery items' });
  }
};

// Admin: Create gallery item
export const createGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, order } = req.body;

    if (!title || !category || !req.file) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: 'Title, category, and image are required' });
      return;
    }

    let imageUrl = '';
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      res.status(500).json({ message: 'Image upload failed' });
      return;
    }

    const item = await prisma.galleryItem.create({
      data: {
        title,
        category,
        imageUrl,
        order: order ? parseInt(order) : 0,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating gallery item:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Error creating gallery item' });
  }
};

// Admin: Update gallery item
export const updateGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, category, order } = req.body;

    let imageUrl = undefined;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        res.status(500).json({ message: 'Image upload failed' });
        return;
      }
    }

    const data: any = {};
    if (title) data.title = title;
    if (category) data.category = category;
    if (order !== undefined) data.order = parseInt(order);
    if (imageUrl) data.imageUrl = imageUrl;

    const item = await prisma.galleryItem.update({
      where: { id },
      data,
    });

    res.json(item);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Error updating gallery item' });
  }
};

// Admin: Delete gallery item
export const deleteGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.galleryItem.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ message: 'Error deleting gallery item' });
  }
};
