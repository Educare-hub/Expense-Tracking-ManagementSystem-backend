import { Request, Response, NextFunction } from 'express';
import { getDbPool } from '../utils/db';

export async function dbMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const pool = await getDbPool();
    (req as any).db = pool; 
    next();
  } catch (err: any) {
    console.error('Database connection error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please try again later.',
      error: err.message,
    });
  }
}
