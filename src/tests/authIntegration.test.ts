import request from 'supertest';
import app from '../../src/app';
import * as userRepo from '../../src/repositories/userRepository';
import { hashPassword } from '../../src/services/authService';

jest.mock('../../src/repositories/userRepository');

describe('Auth Integration Tests (Updated for Verification Flow)', () => {

  const testUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password_hash: '',
    role: 'user',
    created_at: new Date(),
  };

  beforeAll(async () => {
    testUser.password_hash = await hashPassword('1234');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('should register a new user successfully', async () => {

    (userRepo.getUserByEmail as jest.Mock)
      .mockResolvedValueOnce(undefined)     // before creation
      .mockResolvedValueOnce(testUser);     // after creation

    (userRepo.createUser as jest.Mock).mockResolvedValue(1);
    (userRepo.setVerificationCode as jest.Mock).mockResolvedValue(undefined);

    const newUser = {
      first_name: "Test",
      last_name: "User",
      email: "test@example.com",
      phone_number: "0700007778",
      password: "123456",
      confirmPassword: "123456"
    };

    const res = await request(app).post('/api/auth/register').send(newUser);

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("test@example.com");
    expect(res.body.message).toContain("Please verify your account.");
    expect(userRepo.setVerificationCode).toHaveBeenCalled();
  });


  test('should login successfully and send verification code', async () => {

    (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(testUser);
    (userRepo.setVerificationCode as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: "1234" });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body.message).toContain("Verification code sent");
  });


  test('should not login with wrong password', async () => {

    (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: "wrongpassword" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid credentials");
  });

 
  test('should verify user and return token + user', async () => {

    (userRepo.verifyUser as jest.Mock).mockResolvedValue(testUser);

    const res = await request(app)
      .post('/api/auth/verify')
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
