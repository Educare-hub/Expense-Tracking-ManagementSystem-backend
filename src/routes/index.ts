// src/routes/index.ts  
import { Router } from 'express';


import {
  register,
  login,
  verifyCode,
  forgotPassword,    
  resetPassword      
} from '../controllers/authController';

import * as catCtrl from '../controllers/categoryController';
import * as expCtrl from '../controllers/expenseController';
import { requireAuth } from '../middleware/authMiddleware';
import expenseRoutes from "./expenses";
import adminRoutes from "./adminRoutes";

const router = Router();

// PUBLIC AUTH ROUTES 
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/verify-code', verifyCode);
router.post('/auth/forgot-password', forgotPassword);     
router.post('/auth/reset-password', resetPassword);       



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

router.use('/admin', adminRoutes); 

export default router;