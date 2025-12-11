import request from 'supertest';
import app from '../../src/app';
import * as userRepo from '../../src/repositories/userRepository';
import * as authService from '../../src/services/authService';
import { hashPassword } from '../../src/services/authService';

jest.mock('../../src/mailer/mailer');
import * as mailer from '../../src/mailer/mailer';

jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/services/authService', () => ({
  ...jest.requireActual('../../src/services/authService'),
  register: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (mailer.sendVerificationEmail as jest.Mock).mockResolvedValue(true); 
});

describe('Auth Integration Tests (Updated for Verification Flow)', () => {

  const testUser = {
    id: 1,
    username: 'testuser',
    email: 'johngikundi30@yahoo.com',
    password_hash: '',
    role: 'user',
    created_at: new Date(),
  };

  beforeAll(async () => {
    testUser.password_hash = await hashPassword('1234567');
  });

  test('should register a new user successfully', async () => {
    // getUserByEmail to return null (user doesn't exist)
    (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(null);
    
    
    (authService.register as jest.Mock).mockResolvedValue(undefined);
    
    (userRepo.saveVerificationCode as jest.Mock).mockResolvedValue(undefined);

    const newUser = {
      first_name: "John",
      last_name: "Gukundi",
      email: "johngikundi30@yahoo.com",
      phone_number: "0700900000",
      password: "1234567",
      confirmPassword: "1234567"
    };

    const res = await request(app).post('/api/auth/register').send(newUser);

    
    expect(res.status).toBe(201);
    expect(res.body.email).toBe("johngikundi30@yahoo.com");
    expect(res.body.message).toContain("Check your email for verification code");
    expect(userRepo.saveVerificationCode).toHaveBeenCalled();
  });


  test('should login successfully and send verification code', async () => {

    (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(testUser);
    (userRepo.saveVerificationCode as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: "1234567" });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body.message).toContain("Check your email for verification code");
  });


  test('should not login with wrong password', async () => {

    (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
    // actual error message is "Invalid email or password"
    expect(res.body.error).toBe("Invalid email or password");
  });

 
  test('should verify user and return token + user', async () => {

    (userRepo.getVerificationCodeByEmail as jest.Mock).mockResolvedValue({
      email: testUser.email,
      code: "123456", 
      expires_at: new Date(Date.now() + 10 * 60 * 1000) 
    });
    (userRepo.verifyAndActivateUser as jest.Mock).mockResolvedValue(testUser);

    const res = await request(app)
      .post('/api/auth/verify-code')
      .send({ email: testUser.email, code: "123456" }); 

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user).toMatchObject({
      id: testUser.id,
      username: testUser.username,
      email: testUser.email,
      role: testUser.role,
    });
  });

});