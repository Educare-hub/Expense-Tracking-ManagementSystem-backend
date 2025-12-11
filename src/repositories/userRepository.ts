// src/repositories/userRepository.ts
import sql from 'mssql';
import { getDbPool } from '../utils/db';

export type UserCreate = {
  username: string;
  email: string;
  password_hash: string;
};

export async function createUser(newUser: UserCreate) {
  const pool = await getDbPool();
  const result = await pool.request()
    .input('username', sql.VarChar(100), newUser.username)
    .input('email', sql.VarChar(255), newUser.email)
    .input('password_hash', sql.VarChar(255), newUser.password_hash)
    .query(`
      INSERT INTO Users (username, email, password_hash, role)
      OUTPUT INSERTED.id, INSERTED.role
      VALUES (@username, @email, @password_hash, 'User')
    `);
  return result.recordset[0];
}

export async function getUserByEmail(email: string) {
  const pool = await getDbPool();
  const result = await pool.request()
    .input('email', sql.VarChar(255), email)
    .query('SELECT id, username, email, password_hash, role, ISNULL(verified, 0) as verified FROM Users WHERE email = @email');
  return result.recordset[0] || null;
}

export async function saveVerificationCode(email: string, code: string) {
  const pool = await getDbPool();
  
  await pool.request()
    .input('email', sql.VarChar(255), email)
    .input('code', sql.VarChar(6), code)
    .query('UPDATE Users SET verification_code = @code, verified = 0 WHERE email = @email');
  
  console.log(`Verification code saved for ${email}: ${code}`);
}
export async function getVerificationCodeByEmail(email: string) {
  const pool = await getDbPool();
  const result = await pool.request()
    .input('email', sql.VarChar(255), email)
    .query('SELECT verification_code FROM Users WHERE email = @email');
  return result.recordset[0];
}

export async function verifyAndActivateUser(code: string) {
  const pool = await getDbPool();

  try {
    const checkResult = await pool.request()
      .input('code', sql.VarChar(6), code.trim())
      .query(`
        SELECT id, username, email, role, verified, verification_code
        FROM Users 
        WHERE verification_code = @code
      `);

    console.log(`Found user with code:`, checkResult.recordset[0]);

    if (!checkResult.recordset[0]) {
      console.error(`No user found with code: ${code}`);
      return null;
    }

    const user = checkResult.recordset[0];

    if (user.verified === 1) {
      console.log(`User already verified: ${user.email}, returning user data`);
      await pool.request()
        .input('userId', sql.Int, user.id)
        .query('UPDATE Users SET verification_code = NULL WHERE id = @userId');
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
    }

    const result = await pool.request()
      .input('code', sql.VarChar(6), code.trim())
      .query(`
        UPDATE Users 
        SET verified = 1, verification_code = NULL
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.role
        WHERE verification_code = @code
      `);
    
    console.log(`User verified successfully:`, result.recordset[0]);
    return result.recordset[0] || null;

  } catch (err) {
    console.error("verifyAndActivateUser error:", err);
    return null;
  }
}

export async function updateUserPassword(userId: number, hashedPassword: string) {
  const pool = await getDbPool();
  await pool.request()
    .input('userId', sql.Int, userId)
    .input('password', sql.VarChar(255), hashedPassword)
    .query('UPDATE Users SET password_hash = @password WHERE id = @userId');
}

export async function clearVerificationCode(userId: number) {
  const pool = await getDbPool();
  await pool.request()
    .input('userId', sql.Int, userId)
    .query('UPDATE Users SET verification_code = NULL WHERE id = @userId');
}

// FIXED: Proper implementation using getDbPool() like all other functions
export async function updateUserByUserId(userId: number, data: any) {
  const pool = await getDbPool();
  const request = pool.request().input('userId', sql.Int, userId);
  
  const setClauses: string[] = [];
  
  
  if (data.isSuspended !== undefined) {
    request.input('isSuspended', sql.Bit, data.isSuspended);
    setClauses.push('isSuspended = @isSuspended');
  }
  
  if (data.suspensionEnd !== undefined) {
    request.input('suspensionEnd', sql.DateTime2, data.suspensionEnd);
    setClauses.push('suspensionReason = @suspensionEnd');
  }
  
  if (data.email !== undefined) {
    request.input('email', sql.VarChar(255), data.email);
    setClauses.push('email = @email');
  }
  
  if (data.oldEmail !== undefined) {
    request.input('oldEmail', sql.VarChar(255), data.oldEmail);
    setClauses.push('oldEmail = @oldEmail');
  }
  
  if (data.settings !== undefined) {
    request.input('settings', sql.NVarChar(sql.MAX), data.settings);
    setClauses.push('settings = @settings');
  }
  
  if (setClauses.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  const query = `UPDATE Users SET ${setClauses.join(', ')} WHERE id = @userId`;
  await request.query(query);
  
  console.log(`User ${userId} updated successfully`);
}