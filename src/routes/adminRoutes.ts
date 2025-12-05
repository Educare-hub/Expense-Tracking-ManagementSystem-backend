// src/routes/adminRoutes.ts
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';
import * as authCtrl from '../controllers/authController';

const router = Router();

// Protect ALL admin routes: must be logged in + have admin role
router.use(requireAuth);
router.use(requireAdmin);

// ADMIN DASHBOARD DATA — REAL FROM MYSQL
router.get('/users', authCtrl.getAllUsers);        // ← Returns all users
router.get('/expenses', authCtrl.getAllExpenses);  // ← Returns all expenses

// Admin Actions
router.post('/suspend-user', authCtrl.adminSuspendUser);
router.delete('/expenses/:id', authCtrl.adminDeleteExpense);
// ... other admin routes you have

export default router;