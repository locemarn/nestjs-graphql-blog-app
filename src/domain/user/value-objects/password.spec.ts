import { describe, it, expect, beforeAll, vi } from 'vitest';
import { Password } from './password';
import * as bcrypt from 'bcrypt';

// Mock bcrypt to control hashing behavior for predictable tests
// This is important for TDD where you want to test the Password class's logic,
// not necessarily bcrypt's internal workings.
vi.mock('bcrypt', async (importOriginal) => {
  const actual = await importOriginal<typeof bcrypt>();
  return {
    ...actual,
    hash: vi.fn((password) => Promise.resolve(`hashed_${password}`)), // Simple predictable hash
    compare: vi.fn((password, hash) => Promise.resolve(hash === `hashed_${password}`)),
  };
});

describe('Password', () => {
  beforeAll(() => {
    // Ensure mocks are reset before all tests in this suite
    vi.clearAllMocks();
  });

  it('should create a Password instance with a hashed password', async () => {
    const plainPassword = 'StrongPassword123!';
    const password = await Password.create(plainPassword);
    expect(password).toBeInstanceOf(Password);
    expect(password.value).not.toBe(plainPassword); // Should be hashed
    expect(password.value).toBe(`hashed_${plainPassword}`); // Based on our mock
    expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
  });

  it('should throw an error for a password less than 8 characters', async () => {
    await expect(Password.create('short')).rejects.toThrow('Password must be at least 8 characters long.');
  });

  it('should reconstitute a Password from an existing hashed string', () => {
    const hashedPassword = 'someAlreadyHashedPassword';
    const password = Password.fromHashed(hashedPassword);
    expect(password).toBeInstanceOf(Password);
    expect(password.value).toBe(hashedPassword);
  });

  it('should compare a plain password with the stored hashed password and return true for a match', async () => {
    const plainPassword = 'CorrectPassword123!';
    const password = await Password.create(plainPassword); // This hashes it via mock
    const isMatch = await password.compare(plainPassword);
    expect(isMatch).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, password.value);
  });

  it('should compare a plain password with the stored hashed password and return false for a mismatch', async () => {
    const plainPassword = 'CorrectPassword123!';
    const wrongPassword = 'WrongPassword123!';
    const password = await Password.create(plainPassword); // This hashes it via mock
    const isMatch = await password.compare(wrongPassword);
    expect(isMatch).toBe(false);
    expect(bcrypt.compare).toHaveBeenCalledWith(wrongPassword, password.value);
  });

  it('should return the hashed password string via toString', async () => {
    const plainPassword = 'MySecretPassword!';
    const password = await Password.create(plainPassword);
    expect(password.toString()).toBe(`hashed_${plainPassword}`);
  });

  it('should handle null or undefined comparison gracefully', async () => {
    const password = Password.fromHashed('any_hash');
    await expect(password.compare(null as any)).resolves.toBe(false);
    await expect(password.compare(undefined as any)).resolves.toBe(false);
  });

  // Test immutability via ValueObject's equals method (inherited)
  it('should compare two password instances as equal if their hashed values are the same', () => {
    const hashedPassword = 'already_hashed_value';
    const password1 = Password.fromHashed(hashedPassword);
    const password2 = Password.fromHashed(hashedPassword);
    expect(password1.equals(password2)).toBe(true);
  });

  it('should compare two password instances as unequal if their hashed values are different', () => {
    const password1 = Password.fromHashed('hash1');
    const password2 = Password.fromHashed('hash2');
    expect(password1.equals(password2)).toBe(false);
  });
});