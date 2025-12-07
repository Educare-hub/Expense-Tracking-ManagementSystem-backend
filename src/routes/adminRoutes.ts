// src/routes/adminRoutes.ts
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';
import * as authCtrl from '../controllers/authController';

const router = Router();

// Protect ALL admin routes: must be logged in + have admin role
router.use(requireAuth);
router.use(requireAdmin);

// Admin Data Management
router.get('/users', authCtrl.getAllUsers);        // Returns all users from the system (mssql)
router.get('/expenses', authCtrl.getAllExpenses);  // Returns all expenses

// Admin Actions
router.post('/suspend-user', authCtrl.adminSuspendUser);
router.delete('/expenses/:id', authCtrl.adminDeleteExpense);


export default router;