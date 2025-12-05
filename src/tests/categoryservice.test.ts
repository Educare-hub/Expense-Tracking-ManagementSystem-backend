import * as categoryService from '../../src/services/categoryService';
import * as catRepo from '../../src/repositories/categoryRepository';
import { getDbPool } from '../../src/utils/db';

// 1Mock the database pool
jest.mock('../../src/utils/db', () => ({
  getDbPool: jest.fn(),
}));

// 2Mock the repository functions
jest.mock('../../src/repositories/categoryRepository');

describe('Category Service Unit Tests', () => {
  const fakePool = {
    request: jest.fn().mockReturnThis(),
    input: jest.fn().mockReturnThis(),
    query: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDbPool as jest.Mock).mockResolvedValue(fakePool);
  });

  test('createCategory calls repository and returns new category', async () => {
    const newCategory = { id: 1, name: 'Groceries', userId: 42 };
    (catRepo.createCategory as jest.Mock).mockResolvedValue(newCategory);

    const result = await categoryService.createCategory('Groceries', 42);

    expect(catRepo.createCategory).toHaveBeenCalledWith(fakePool, 'Groceries', 42);
    expect(result).toEqual(newCategory);
  });

  test('listCategories calls repository and returns categories', async () => {
    const categories = [
      { id: 1, name: 'Groceries', userId: 42 },
      { id: 2, name: 'Utilities', userId: 42 },
    ];
    (catRepo.getCategories as jest.Mock).mockResolvedValue(categories);

    const result = await categoryService.listCategories(42);

    expect(catRepo.getCategories).toHaveBeenCalledWith(fakePool, 42);
    expect(result).toEqual(categories);
  });

  test('updateCategory calls repository and returns updated category', async () => {
    const updated = { id: 1, name: 'Food', userId: 42 };
    (catRepo.updateCategory as jest.Mock).mockResolvedValue(updated);

    const result = await categoryService.updateCategory(1, 'Food');

    expect(catRepo.updateCategory).toHaveBeenCalledWith(fakePool, 1, 'Food');
    expect(result).toEqual(updated);
  });

  test('deleteCategory calls repository and returns deletion confirmation', async () => {
    const deleted = { deleted: true };
    (catRepo.deleteCategory as jest.Mock).mockResolvedValue(deleted);

    const result = await categoryService.deleteCategory(1);

    expect(catRepo.deleteCategory).toHaveBeenCalledWith(fakePool, 1);
    expect(result).toEqual(deleted);
  });
});
