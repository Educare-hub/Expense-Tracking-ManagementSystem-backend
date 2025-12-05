
import { getDbPool } from '../utils/db';

export async function getExpenseStats(userId: number, year: number) {
  const pool = await getDbPool();


  const byCategory = await pool.request()
    .input("userId", userId)
    .input("year", year)
    .query(`
      SELECT 
        COALESCE(c.name, 'Uncategorized') AS category,
        SUM(e.amount) AS total
      FROM Expenses e
      LEFT JOIN Categories c ON e.category_id = c.id
      WHERE 
        e.user_id = @userId
        AND YEAR(e.expense_date) = @year
      GROUP BY c.name
      ORDER BY total DESC;
    `);

  const byMonth = await pool.request()
    .input("userId", userId)
    .input("year", year)
    .query(`
      SELECT 
        FORMAT(e.expense_date, 'yyyy-MM') AS month,
        SUM(e.amount) AS total
      FROM Expenses e
      WHERE 
        e.user_id = @userId
        AND YEAR(e.expense_date) = @year
      GROUP BY FORMAT(e.expense_date, 'yyyy-MM')
      ORDER BY month;
    `);

 
  const recurring = await pool.request()
    .input("userId", userId)
    .query(`
      SELECT 
        COUNT(*) AS count,
        SUM(amount) AS total
      FROM Expenses
      WHERE user_id = @userId AND is_recurring = 1;
    `);

  return {
    byCategory: byCategory.recordset,
    byMonth: byMonth.recordset,
    recurring: recurring.recordset[0]
  };
}
