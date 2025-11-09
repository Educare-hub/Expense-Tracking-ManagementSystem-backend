import sql from 'mssql';
import { getDbPool } from '../utils/db';

export interface UserCreate {
  username: string;
  email: string;
  password_hash: string;
}

export async function createUser(newUser: UserCreate) {
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('username', sql.VarChar(100), newUser.username)
      .input('email', sql.VarChar(255), newUser.email)
      .input('password_hash', sql.VarChar(255), newUser.password_hash)
      .query(`
        INSERT INTO Users (username, email, password_hash)
        OUTPUT INSERTED.id
        VALUES (@username, @email, @password_hash);
      `);
    return result.recordset[0].id;
  } catch (err: any) {
    if (err?.number === 2627) throw new Error('Email already exists');
    console.error('Error creating user:', err);
    throw new Error('Failed to create user');
  }
}

export async function getUserByEmail(email: string) {
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('email', sql.VarChar(255), email)
      .query(`
        SELECT id, username, email, password_hash, role, created_at
        FROM Users
        WHERE email = @email
      `);
    return result.recordset[0];
  } catch (err) {
    console.error('Error fetching user by email:', err);
    throw new Error('Failed to fetch user');
  }
}
