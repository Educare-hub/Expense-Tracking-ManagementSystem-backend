import sql from 'mssql';

export async function createCategory(pool: sql.ConnectionPool, name: string, userId?: number) {
  const result = await pool.request()
    .input('name', sql.VarChar(100), name)
    .input('user_id', sql.Int, userId ?? null)
    .query(`
      INSERT INTO Categories (name, user_id)
      VALUES (@name, @user_id);
      SELECT SCOPE_IDENTITY() as id, name, user_id as userId;
    `);
  return result.recordset[0];
}

export async function getCategories(pool: sql.ConnectionPool, userId?: number) {
  const req = pool.request();
  if (userId) {
    req.input('user_id', sql.Int, userId);
    const res = await req.query('SELECT id, name, user_id as userId FROM Categories WHERE user_id = @user_id OR user_id IS NULL');
    return res.recordset;
  } else {
    const res = await req.query('SELECT id, name, user_id as userId FROM Categories');
    return res.recordset;
  }
}

export async function updateCategory(pool: sql.ConnectionPool, id: number, name: string) {
  const res = await pool.request()
    .input('id', sql.Int, id)
    .input('name', sql.VarChar(100), name)
    .query('UPDATE Categories SET name = @name WHERE id = @id; SELECT id, name, user_id as userId FROM Categories WHERE id = @id;');
  return res.recordset[0];
}

export async function deleteCategory(pool: sql.ConnectionPool, id: number) {
  await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Categories WHERE id = @id');
  return {deleted: true};
}
