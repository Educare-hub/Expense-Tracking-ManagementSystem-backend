import { hashPassword, checkPassword, createToken, register, login } from '../../src/services/authService';
import * as userRepo from '../../src/repositories/userRepository';

jest.mock('../../src/repositories/userRepository'); 

test('hashPassword creates a different string', async () => {
  const password = '1234567';
  const hash = await hashPassword(password);
  expect(hash).not.toBe(password);
});

test('checkPassword returns true for correct password', async () => {
  const password = '1234567';
  const hash = await hashPassword(password);
  const result = await checkPassword(password, hash);
  expect(result).toBe(true);
});

test('createToken returns a string', () => {
  const token = createToken(1, 'user');
  expect(typeof token).toBe('string');
});

test('register calls createUser', async () => {
  const user = { email: 'johngikundi30@yahoo.com', password_hash: '1234567' };
  (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(null);
  await register(user as any);
  expect(userRepo.createUser).toHaveBeenCalled();
});

test('login returns token and user', async () => {
  const fakeUser = { id: 1, username: 'test', email: 'johngikundi30@yahoo.com', role: 'user', password_hash: await hashPassword('1234567') };
  (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(fakeUser);
  const result = await login('johngikundi30@yahoo.com', '1234567');
  expect(result.user.email).toBe('johngikundi30@yahoo.com');
  expect(typeof result.token).toBe('string');
});
