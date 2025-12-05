//src/repositories/expenseRepository.ts
import sql from 'mssql';

export async function createExpense(pool: sql.ConnectionPool, payload: {
  user_id: number;
  category_id?: number | null;
  amount: number;
  currency?: string;
  note?: string;
  receipt_url?: string;
  is_recurring?: boolean;
  recurring_interval?: string | null;
  expense_date: string; // YYYY-MM-DD
}) {
  const res = await pool.request()
    .input('user_id', sql.Int, payload.user_id)
    .input('category_id', sql.Int, payload.category_id ?? null)
    .input('amount', sql.Decimal(18,2), payload.amount)
    .input('currency', sql.VarChar(10), payload.currency ?? 'KES')
    .input('note', sql.NVarChar(1000), payload.note ?? null)
    .input('receipt_url', sql.VarChar(500), payload.receipt_url ?? null)
    .input('is_recurring', sql.Bit, payload.is_recurring ?? 0)
    .input('recurring_interval', sql.VarChar(50), payload.recurring_interval ?? null)
    .input('expense_date', sql.Date, payload.expense_date)
    .query(`
      INSERT INTO Expenses (user_id, category_id, amount, currency, note, receipt_url, is_recurring, recurring_interval, expense_date)
      VALUES (@user_id, @category_id, @amount, @currency, @note, @receipt_url, @is_recurring, @recurring_interval, @expense_date);
      SELECT SCOPE_IDENTITY() AS id;
    `);
  return res.recordset[0];
}

export async function getExpenses(pool: sql.ConnectionPool, userId: number, filters?: {category_id?: number, from?: string, to?: string, minAmount?: number, maxAmount?: number}) {
  let base = `SELECT e.id, e.user_id, e.category_id, e.amount, e.currency, e.note, e.receipt_url, e.is_recurring, e.recurring_interval, e.expense_date, e.created_at
              FROM Expenses e WHERE e.user_id = @user_id`;
  const req = pool.request().input('user_id', sql.Int, userId);

  if (filters?.category_id) {
    base += ' AND e.category_id = @category_id';
    req.input('category_id', sql.Int, filters.category_id);
  }
  if (filters?.from) {
    base += ' AND e.expense_date >= @from';
    req.input('from', sql.Date, filters.from);
  }
  if (filters?.to) {
    base += ' AND e.expense_date <= @to';
    req.input('to', sql.Date, filters.to);
  }
  if (filters?.minAmount !== undefined) {
    base += ' AND e.amount >= @minAmount';
    req.input('minAmount', sql.Decimal(18,2), filters.minAmount);
  }
  if (filters?.maxAmount !== undefined) {
    base += ' AND e.amount <= @maxAmount';
    req.input('maxAmount', sql.Decimal(18,2), filters.maxAmount);
  }

  const res = await req.query(base + ' ORDER BY e.expense_date DESC');
  return res.recordset;
}

export async function getExpenseById(pool: sql.ConnectionPool, id: number, userId: number) {
  const res = await pool.request()
    .input('id', sql.Int, id)
    .input('user_id', sql.Int, userId)
    .query('SELECT * FROM Expenses WHERE id = @id AND user_id = @user_id');
  return res.recordset[0];
}

export async function updateExpense(pool: sql.ConnectionPool, id: number, userId: number, updates: any) {
  const req = pool.request()
    .input('id', sql.Int, id)
    .input('user_id', sql.Int, userId);
  const setParts: string[] = [];
  if (updates.category_id !== undefined) { req.input('category_id', sql.Int, updates.category_id ?? null); setParts.push('category_id = @category_id'); }
  if (updates.amount !== undefined) { req.input('amount', sql.Decimal(18,2), updates.amount); setParts.push('amount = @amount'); }
  if (updates.currency !== undefined) { req.input('currency', sql.VarChar(10), updates.currency); setParts.push('currency = @currency'); }
  if (updates.note !== undefined) { req.input('note', sql.NVarChar(1000), updates.note); setParts.push('note = @note'); }
  if (updates.receipt_url !== undefined) { req.input('receipt_url', sql.VarChar(500), updates.receipt_url); setParts.push('receipt_url = @receipt_url'); }
  if (updates.is_recurring !== undefined) { req.input('is_recurring', sql.Bit, updates.is_recurring); setParts.push('is_recurring = @is_recurring'); }
  if (updates.recurring_interval !== undefined) { req.input('recurring_interval', sql.VarChar(50), updates.recurring_interval); setParts.push('recurring_interval = @recurring_interval'); }
  if (updates.expense_date !== undefined) { req.input('expense_date', sql.Date, updates.expense_date); setParts.push('expense_date = @expense_date'); }

  if (setParts.length === 0) throw new Error('No fields to update');

  const query = `UPDATE Expenses SET ${setParts.join(', ')}, updated_at = SYSDATETIME() WHERE id = @id AND user_id = @user_id;
                 SELECT * FROM Expenses WHERE id = @id AND user_id = @user_id;`;
  const res = await req.query(query);
  return res.recordset[0];
}

export async function deleteExpense(pool: sql.ConnectionPool, id: number, userId: number) {
  await pool.request()
    .input('id', sql.Int, id)
    .input('user_id', sql.Int, userId)
    .query('DELETE FROM Expenses WHERE id = @id AND user_id = @user_id');
  return {deleted: true};
}
