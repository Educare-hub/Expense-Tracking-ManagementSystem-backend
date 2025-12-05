
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as statsService from '../services/statsService';

export async function statsExpenses(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const year = Number(req.query.year) || new Date().getFullYear();

    const stats = await statsService.getExpenseStats(userId, year);

    res.json({
      success: true,
      data: stats
    });
  } catch (err: any) {
    console.error("❌ Stats Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}
