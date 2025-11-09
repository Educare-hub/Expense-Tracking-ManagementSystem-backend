import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/userRepository';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_token';

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function checkPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function createToken(userId: number, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export async function register(user: userRepo.UserCreate) {
  const existing = await userRepo.getUserByEmail(user.email);
  if (existing) throw new Error('Email already in use');

  user.password_hash = await hashPassword(user.password_hash);

  await userRepo.createUser(user);
}

export async function login(email: string, password: string) {
  const user = await userRepo.getUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const ok = await checkPassword(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');

  const token = createToken(user.id, user.role);

  return { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
}
