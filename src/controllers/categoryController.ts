// src/controllers/categoryController.ts
import { Request, Response } from 'express';
import * as catService from '../services/categoryService';
import { AuthRequest } from '../middleware/authMiddleware';

export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const { name, userId } = req.body;
    
    // FIX 1: Validate name is provided
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const created = await catService.createCategory(name, userId ?? req.user?.userId);
    res.status(201).json(created);
  } catch (err:any) {
    // FIX 2: Return 500 for database/service errors instead of 400
    res.status(500).json({ error: err.message });
  }
}

export async function listCategories(req: AuthRequest, res: Response) {
  try {
    const categories = await catService.listCategories(req.user?.userId);
    res.json(categories);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await catService.updateCategory(Number(id), name);
    res.json(updated);
  } catch (err:any) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await catService.deleteCategory(Number(id));
    
    // FIX 3: Check if category was found/deleted
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(deleted);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
}