// src/routes/index.ts  ← FINAL WORKING VERSION
import { Router } from 'express';

// CHANGE THIS LINE — THIS IS THE FIX
import {
  register,
  login,
  verifyCode,
  forgotPassword,    // ← NOW EXPLICITLY IMPORTED
  resetPassword      // ← NOW EXPLICITLY IMPORTED
} from '../controllers/authController';

import * as catCtrl from '../controllers/categoryController';
import * as expCtrl from '../controllers/expenseController';
import { requireAuth } from '../middleware/authMiddleware';
import expenseRoutes from "./expenses";
import adminRoutes from "./adminRoutes";

const router = Router();

// PUBLIC AUTH ROUTES — NOW WORK 100%
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/verify-code', verifyCode);
router.post('/auth/forgot-password', forgotPassword);     // ← NOW WORKS
router.post('/auth/reset-password', resetPassword);       // ← NOW WORKS



// Expense routes
router.use("/expenses", expenseRoutes);

// Category routes
router.get('/categories', requireAuth, catCtrl.listCategories);
router.post('/categories', requireAuth, catCtrl.createCategory);
router.put('/categories/:id', requireAuth, catCtrl.updateCategory);
router.delete('/categories/:id', requireAuth, catCtrl.deleteCategory);

// Individual expense management
router.post('/expenses', requireAuth, expCtrl.createExpense);
router.get('/expenses', requireAuth, expCtrl.listExpenses);
router.get('/expenses/:id', requireAuth, expCtrl.getExpense);
router.put('/expenses/:id', requireAuth, expCtrl.updateExpense);
router.delete('/expenses/:id', requireAuth, expCtrl.deleteExpense);


// ADMIN ROUTES (Protected by requireAuth + requireAdmin)

router.use('/admin', adminRoutes); // ← ADDED THIS

export default router;