import { Request, Response } from 'express';
import * as authService from '../services/authService';
import * as userRepo from '../repositories/userRepository';

export async function register(req: Request, res: Response) {
  console.log('Incoming register data:', req.body); // For debugging
  try {
    const { first_name, last_name, email, phone_number, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newUser = {
      username: `${first_name} ${last_name}`,
      email,
      password_hash: password,
    };

    await authService.register(newUser);

    const createdUser = await userRepo.getUserByEmail(email);

    if (!createdUser) {
      return res.status(500).json({ error: 'User registration failed' });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        role: createdUser.role,
        created_at: createdUser.created_at,
      },
    });
  } catch (err: any) {
    console.error('Register error:', err.message);
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  console.log('Incoming login data:', req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err: any) {
    console.error('Login error:', err.message);
    res.status(400).json({ error: err.message });
  }
}
