// src/routes/adminRoutes.ts
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';
import * as authCtrl from '../controllers/authController';
// import { suspendUser, restoreUser } from '../controllers/authController';

const router = Router();

// ensure that users of my site need authentication and admin role for all admin routes
router.use(requireAuth);
router.use(requireAdmin);

// Admin Data Management
router.get('/users', authCtrl.getAllUsers);        
router.get('/expenses', authCtrl.getAllExpenses);  

// Admin Actions
router.post('/suspend-user', authCtrl.adminSuspendUser);
router.delete('/expenses/:id', authCtrl.adminDeleteExpense);
// router.patch('/users/:id/suspend', authMiddleware, suspendUser);
// router.patch('/users/:id/restore', authMiddleware, restoreUser);



export default router;