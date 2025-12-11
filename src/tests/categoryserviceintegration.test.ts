// src/tests/categoryserviceintegration.test.ts


jest.mock('../middleware/authMiddleware', () => ({
  __esModule: true,

  // exports used by adminRoutes
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { userId: 1, role: "Admin" };
    next();
  },
  requireAdmin: (req: any, res: any, next: any) => next(),

  // export used by category, expenses.ts
  default: {
    authMiddleware: (req: any, res: any, next: any) => {
      req.user = { userId: 1, role: "Admin" };
      next();
    },
    adminMiddleware: (req: any, res: any, next: any) => next(),
  }
}));

import request from 'supertest';
import app from '../app';
import * as categoryRepo from '../repositories/categoryRepository';
import { getDbPool } from '../utils/db';

// How my repository and DB pool is mocked 
jest.mock('../repositories/categoryRepository');
jest.mock('../utils/db');

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
      .send({ name: 'Food' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(testCategory);
    expect(categoryRepo.createCategory).toHaveBeenCalledWith(fakePool, 'Food', 1);
  });

  // Get Categories
  it('should get categories successfully', async () => {
    (categoryRepo.getCategories as jest.Mock).mockResolvedValue([testCategory]);

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([testCategory]);
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
    expect(res.body).toEqual(updatedCategory);
    expect(categoryRepo.updateCategory).toHaveBeenCalledWith(fakePool, 1, 'Groceries');
  });

  // Test for missing required field
it('should return 400 when creating a category without a name', async () => {
  const res = await request(app)
    .post('/api/categories')
    .send({});

  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('error');
});

// Test for database error
it('should return 500 when database operation fails', async () => {
  (categoryRepo.createCategory as jest.Mock).mockRejectedValue(
    new Error('Database connection failed')
  );

  const res = await request(app)
    .post('/api/categories')
    .send({ name: 'Food' });

  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty('error');
});

// Test for deleting non-existent category
it('should return 404 when deleting a non-existent category', async () => {
  (categoryRepo.deleteCategory as jest.Mock).mockResolvedValue(null);

  const res = await request(app).delete('/api/categories/999');

  expect(res.status).toBe(404);
});

    it('should delete category successfully', async () => {
    (categoryRepo.deleteCategory as jest.Mock).mockResolvedValue({ deleted: true });

    const res = await request(app).delete('/api/categories/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
    expect(categoryRepo.deleteCategory).toHaveBeenCalledWith(fakePool, 1);
  });
});
