import { Router } from 'express';
import * as authCtrl from '../controllers/authController';
import * as catCtrl from '../controllers/categoryController';
import * as expCtrl from '../controllers/expenseController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);

router.get('/categories', requireAuth, catCtrl.listCategories);
router.post('/categories', requireAuth, catCtrl.createCategory);
router.put('/categories/:id', requireAuth, catCtrl.updateCategory);
router.delete('/categories/:id', requireAuth, catCtrl.deleteCategory);

router.post('/expenses', requireAuth, expCtrl.createExpense);
router.get('/expenses', requireAuth, expCtrl.listExpenses);
router.get('/expenses/:id', requireAuth, expCtrl.getExpense);
router.put('/expenses/:id', requireAuth, expCtrl.updateExpense);
router.delete('/expenses/:id', requireAuth, expCtrl.deleteExpense);

export default router;
