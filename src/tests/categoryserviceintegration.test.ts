import request from 'supertest';
import app from '../app';
import * as categoryRepo from '../repositories/categoryRepository';
import { getDbPool } from '../utils/db';

// Mock repository and DB pool
jest.mock('../repositories/categoryRepository');
jest.mock('../utils/db');

// Mock auth middleware to bypass authentication
jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { userId: 1 }; // mock logged-in user
    next();
  },
  requireAdmin: (req: any, res: any, next: any) => next(),
}));

describe('Category Service Integration Tests', () => {
  const fakePool = {} as any;
  const testCategory = { id: 1, name: 'Food', userId: 1 };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDbPool as jest.Mock).mockResolvedValue(fakePool);
  });

  // Create Category
  it('should create a category successfully', async () => {
    (categoryRepo.createCategory as jest.Mock).mockResolvedValue(testCategory);

    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Food' }); // userId handled by req.user

    expect(res.status).toBe(201);
    expect(res.body).toEqual(testCategory); // match raw object returned by controller
    expect(categoryRepo.createCategory).toHaveBeenCalledWith(fakePool, 'Food', 1);
  });

  // Get Categories
  it('should get categories successfully', async () => {
    (categoryRepo.getCategories as jest.Mock).mockResolvedValue([testCategory]);

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([testCategory]); // raw array returned
    expect(categoryRepo.getCategories).toHaveBeenCalledWith(fakePool, 1);
  });

  // Update Category
  it('should update category successfully', async () => {
    const updatedCategory = { ...testCategory, name: 'Groceries' };
    (categoryRepo.updateCategory as jest.Mock).mockResolvedValue(updatedCategory);

    const res = await request(app)
      .put('/api/categories/1')
      .send({ name: 'Groceries' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedCategory); // raw object
    expect(categoryRepo.updateCategory).toHaveBeenCalledWith(fakePool, 1, 'Groceries');
  });

  // Delete Category
  it('should delete category successfully', async () => {
    (categoryRepo.deleteCategory as jest.Mock).mockResolvedValue({ deleted: true });

    const res = await request(app).delete('/api/categories/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
    expect(categoryRepo.deleteCategory).toHaveBeenCalledWith(fakePool, 1);
  });
});
