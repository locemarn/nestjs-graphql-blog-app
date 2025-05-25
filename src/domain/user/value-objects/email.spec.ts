import { describe, it, expect } from 'vitest';
import { Email } from './email';

describe('Email', () => {
  it('should create an Email instance with a valid email address', () => {
    const email = Email.create('test@example.com');
    expect(email).toBeInstanceOf(Email);
    expect(email.value).toBe('test@example.com');
  });

  it('should store email in lowercase', () => {
    const email = Email.create('Test@Example.Com');
    expect(email.value).toBe('test@example.com');
  });

  it('should throw an error for an empty email address', () => {
    expect(() => Email.create('')).toThrow('Email cannot be empty.');
  });

  it('should throw an error for an invalid email format (missing @)', () => {
    expect(() => Email.create('invalid-email.com')).toThrow('Invalid email format.');
  });

  it('should throw an error for an invalid email format (missing domain)', () => {
    expect(() => Email.create('invalid@')).toThrow('Invalid email format.');
  });

  it('should throw an error for an invalid email format (missing local part)', () => {
    expect(() => Email.create('@example.com')).toThrow('Invalid email format.');
  });

  it('should compare two Email instances with identical values as equal', () => {
    const email1 = Email.create('test@example.com');
    const email2 = Email.create('test@example.com');
    expect(email1.equals(email2)).toBe(true);
  });

  it('should compare two Email instances with different values as unequal', () => {
    const email1 = Email.create('test1@example.com');
    const email2 = Email.create('test2@example.com');
    expect(email1.equals(email2)).toBe(false);
  });

  it('should compare two Email instances with case-insensitive equality', () => {
    const email1 = Email.create('test@example.com');
    const email2 = Email.create('TEST@EXAMPLE.COM');
    expect(email1.equals(email2)).toBe(true);
  });

  it('should return the string representation of the email', () => {
    const email = Email.create('test@example.com');
    expect(email.toString()).toBe('test@example.com');
  });

  it('should return false when comparing with null or undefined', () => {
    const email = Email.create('test@example.com');
    expect(email.equals(null as any)).toBe(false);
    expect(email.equals(undefined as any)).toBe(false);
  });

  it('should return false when comparing with a non-Email object', () => {
    const email = Email.create('test@example.com');
    expect(email.equals('test@example.com' as any)).toBe(false);
    expect(email.equals({ value: 'test@example.com' } as any)).toBe(false);
  });
});