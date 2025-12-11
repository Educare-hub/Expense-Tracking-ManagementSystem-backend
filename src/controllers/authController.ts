// src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as authService from '../services/authService';
import * as userRepo from '../repositories/userRepository';
import { sendVerificationEmail } from '../mailer/mailer';
import bcrypt from 'bcryptjs';
import { getDbPool } from '../utils/db';
import sql from 'mssql';

// Validation helpers
const validateInput = {
  email: (email: string) => {
    if (!email) throw { status: 400, message: 'Email is required' };
    if (email.length > 255) throw { status: 413, message: 'Email exceeds 255 characters' };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw { status: 400, message: 'Invalid email format' };
    
    return email.toLowerCase().trim();
  },
  
  password: (password: string) => {
    if (!password) throw { status: 400, message: 'Password is required' };
    if (password.length < 6) throw { status: 400, message: 'Password must be at least 6 characters' };
    if (password.length > 255) throw { status: 413, message: 'Password exceeds 255 characters' };
    
    return password;
  },
  
  username: (username: string) => {
    if (!username) throw { status: 400, message: 'Username is required' };
    if (username.length > 100) throw { status: 413, message: 'Username exceeds 100 characters' };
    if (username.trim().length === 0) throw { status: 400, message: 'Username cannot be empty' };
    
    return username.trim();
  },
  
  verificationCode: (code: string) => {
    if (!code) throw { status: 400, message: 'Verification code is required' };
    if (!/^\d{6}$/.test(code.trim())) throw { status: 400, message: 'Code must be exactly 6 digits' };
    
    return code.trim();
  }
};

export async function register(req: Request, res: Response) {
  try {
    const { first_name, last_name, email, password, username } = req.body;
    
    // Validate inputs
    const validEmail = validateInput.email(email);
    const validPassword = validateInput.password(password);
    
    const finalUsername = username?.trim() ||
      (first_name && last_name ? `${first_name} ${last_name}`.trim() : validEmail.split('@')[0]);
    
    const validUsername = validateInput.username(finalUsername);

    // Check if user exists BEFORE attempting registration
    const existingUser = await userRepo.getUserByEmail(validEmail);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email already registered. Please login instead.' 
      });
    }

    await authService.register({
      username: validUsername,
      email: validEmail,
      password_hash: validPassword
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await userRepo.saveVerificationCode(validEmail, code);
    await sendVerificationEmail(validEmail, code);

    console.log(`VERIFICATION CODE → ${validEmail}: ${code}`);

    return res.status(201).json({
      success: true,
      message: 'Check your email for verification code',
      email: validEmail
    });

  } catch (err: any) {
    console.error('REGISTER ERROR:', err);
    
    // Handle validation errors
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    
    // Handle database errors
    if (err.message?.includes('duplicate') || err.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already registered. Please login instead.' });
    }
    
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    // Validate inputs
    const validEmail = validateInput.email(email);
    const validPassword = validateInput.password(password);
    
    console.log('LOGIN ATTEMPT:', validEmail);
    
    const user = await userRepo.getUserByEmail(validEmail);
    console.log('USER FOUND:', user ? 'YES' : 'NO');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('COMPARING PASSWORD...');
    const isValidPassword = await bcrypt.compare(validPassword, user.password_hash);
    console.log('PASSWORD VALID:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isVerified = user.verified === 1 || user.verified === true;
    console.log('USER VERIFIED:', isVerified, '(raw value:', user.verified, ')');

    if (isVerified) {
      const token = authService.createToken(user.id, user.role || 'User');
      console.log('TOKEN CREATED, LOGGING IN USER');
      
      return res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role 
        } 
      });
    }

    console.log('USER NOT VERIFIED, SENDING CODE');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await userRepo.saveVerificationCode(validEmail, code);
    await sendVerificationEmail(validEmail, code);
    console.log(`LOGIN CODE → ${validEmail}: ${code}`);

    return res.json({ 
      requiresVerification: true, 
      message: 'Check your email for verification code', 
      email: validEmail 
    });

  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    
    // Handle validation errors
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

export async function verifyCode(req: Request, res: Response) {
  try {
    const { code } = req.body;
    
    // Validate code
    const validCode = validateInput.verificationCode(code);
    
    const user = await userRepo.verifyAndActivateUser(validCode);

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification code'
      });
    }

    const token = authService.createToken(user.id, user.role || 'User');

    return res.json({
      message: 'Success!',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });

  } catch (err: any) {
    console.error('VERIFY CODE ERROR:', err);
    
    // Handle validation errors
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Always generate and send code and no leak if user exists
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await userRepo.saveVerificationCode(normalizedEmail, resetCode);
    await sendVerificationEmail(normalizedEmail, resetCode);

    console.log(`PASSWORD RESET CODE → ${normalizedEmail}: ${resetCode}`);

    return res.json({
      success: true,
      message: "Reset code sent to your email",
      email: normalizedEmail
    });

  } catch (err: any) {
    console.error("Forgot password error:", err);
    return res.json({
      success: true,
      message: "If your email is registered, a reset code was sent."
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await userRepo.verifyAndActivateUser(code.trim());

    if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    await authService.updatePassword(user.id, password);

    const token = authService.createToken(user.id, user.role || 'User');

    res.json({
      message: "Password reset successful",
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function adminSuspendUser(req: AuthRequest, res: Response) {
  try {
    const { userId, suspend } = req.body;

    if (!userId || suspend === undefined) {
      return res.status(400).json({ message: 'userId and suspend status required' });
    }

    const pool = await getDbPool();
    const request = pool.request();
    
    request.input('isSuspended', sql.Bit, suspend ? 1 : 0);
    request.input('userId', sql.Int, userId);
    
    await request.query('UPDATE users SET is_suspended = @isSuspended WHERE id = @userId');
    
    res.json({
      message: suspend ? 'User suspended successfully' : 'User activated successfully'
    });
  } catch (err) {
    console.error('Admin suspend user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function adminResetUserPassword(req: AuthRequest, res: Response) {
  try {
    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'userId and newPassword required' });
    }
    
    await authService.updatePassword(Number(userId), newPassword);
    res.json({ message: 'User password reset successfully' });
  } catch (err) {
    console.error('Admin reset user password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function adminChangeUserEmail(req: AuthRequest, res: Response) {
  try {
    const { userId, newEmail } = req.body;
    
    if (!userId || !newEmail) {
      return res.status(400).json({ message: 'userId and newEmail required' });
    }
    
    await userRepo.updateUserByUserId(Number(userId), {
      email: newEmail
    });
    
    res.json({ message: 'User email changed successfully' });
  } catch (err) {
    console.error('Admin change user email error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function adminUpdateUserSettings(req: AuthRequest, res: Response) {
  try {
    const { userId, settings } = req.body;
    
    if (!userId || !settings) {
      return res.status(400).json({ message: 'userId and settings required' });
    }
    
    await userRepo.updateUserByUserId(Number(userId), {
      settings: JSON.stringify(settings)
    });
    
    res.json({ message: 'User settings updated successfully' });
  } catch (err) {
    console.error('Admin update user settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function adminDeleteExpense(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const pool = await getDbPool();
    const request = pool.request();
    
    request.input('id', sql.Int, id);
    
    const result = await request.query('SELECT * FROM expenses WHERE id = @id');
    
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    const deleteRequest = pool.request();
    deleteRequest.input('id', sql.Int, id);
    await deleteRequest.query('DELETE FROM expenses WHERE id = @id');
    
    return res.json({ 
      success: true, 
      message: 'Expense deleted successfully' 
    });
  } catch (error) {
    console.error('Admin delete expense error:', error);
    return res.status(500).json({ error: 'Failed to delete expense' });
  }
}

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const pool = await getDbPool();
    const request = pool.request();
    
    const result = await request.query(`
      SELECT 
        id, 
        username as name,
        email, 
        role, 
        ISNULL(verified, 0) as verified,
        ISNULL(is_suspended, 0) as is_suspended,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    console.log(`Fetched ${result.recordset.length} users for admin dashboard`);
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ 
      error: 'Server error',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}

export async function getAllExpenses(req: AuthRequest, res: Response) {
  try {
    const pool = await getDbPool();
    const request = pool.request();
    
    const result = await request.query(`
      SELECT 
        e.id,
        e.user_id,
        e.amount,
        e.currency,
        e.note,
        e.expense_date,
        e.created_at,
        u.username,
        u.email,
        c.name as category_name
      FROM expenses e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN categories c ON e.category_id = c.id
      ORDER BY e.expense_date DESC
    `);
    
    console.log(`Fetched ${result.recordset.length} expenses for admin dashboard`);
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Get all expenses error:', err);
    res.status(500).json({ 
      error: 'Server error',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}