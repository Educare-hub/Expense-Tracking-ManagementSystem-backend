import { Request, Response } from 'express';
import * as expService from '../services/expenseService';
import { AuthRequest } from '../middleware/authMiddleware';

export async function createExpense(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const payload = { ...req.body, user_id: userId };
    const created = await expService.createExpense(payload);
    res.status(201).json(created);
  } catch (err:any) {
    res.status(400).json({ error: err.message });
  }
}

export async function listExpenses(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { category_id, from, to, minAmount, maxAmount } = req.query;
    const filters = {
      category_id: category_id ? Number(category_id) : undefined,
      from: from as string | undefined,
      to: to as string | undefined,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined
    };
    const list = await expService.listExpenses(userId, filters);
    res.json(list);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getExpense(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const item = await expService.getExpense(userId, Number(id));
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateExpense(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updated = await expService.updateExpense(userId, Number(id), req.body);
    res.json(updated);
  } catch (err:any) {
    res.status(400).json({ error: err.message });
  }
}

// export const updateExpense = async (req: Request, res: Response => { try {
//     const {id} = req.params 
//     const {little, amount, category, date} = req.body
//     const pool = await poolPromise
//     await pool.request ()
//     .input ('id', id)
//     .input('title', title)
//     .input('amount', amount)
//     .input('catergory', category)
//     .input('date', date)
//     .querry('UPDATE Expenses SET title = @title, amount = @amount, category = @category, date = @date WHERE id = @id')
//       res.status(200).json({message: 'Expense updated successfully'})
//     } catch (err) {
//       res.status(500).json({ message: 'Error updating expense', error: err
//     })
//     }
//   }

export async function deleteExpense(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await expService.deleteExpense(userId, Number(id));
    res.json(result);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
}
