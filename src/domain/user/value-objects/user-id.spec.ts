import { describe, it, expect } from 'vitest';
import { UniqueEntityID } from '@domain/shared';
import { UserId } from '@domain/user/value-objects/user-id';
import { validate as uuidValidate } from 'uuid';

describe('UserId', () => {
  it('should create an UserId with a generated UUID if no value is provided', () => {
    const userId = UserId.create();
    expect(userId).toBeDefined();
    expect(userId).toBeInstanceOf(UserId);
    expect(userId.value).toBeInstanceOf(UniqueEntityID);
    expect(uuidValidate(userId.value.toString())).toBe(true);
  });

  it('should create a UserId from a valid UUID string', () => {
    const uuid = '123e4567-e89b-12d3-a456-426655440000';
    const userId = UserId.fromString(uuid);
    expect(userId).toBeInstanceOf(UserId);
    expect(userId.value.toValue()).toBe(uuid);
  });

  it('should throw an error if an invalid UUID string is provided to fromString', () => {
    const invalidUuid = 'not-a-uuid';
    expect(() => UserId.fromString(invalidUuid)).toThrow('Invalid UUID format for UniqueEntityID.');
  });

  it('should compare two UserId instances for equality (same value)', () => {
    const uuid = '123e4567-e89b-12d3-a456-426655440000';
    const userId1 = UserId.fromString(uuid);
    const userId2 = UserId.fromString(uuid);
    expect(userId1.equals(userId2)).toBe(true);
  });

  it('should compare two UserId instances for inequality (different value)', () => {
    const userId1 = UserId.create();
    const userId2 = UserId.create();
    expect(userId1.equals(userId2)).toBe(false);
  });

  it('should convert UserId to its string representation', () => {
    const uuid = '123e4567-e89b-12d3-a456-426655440000';
    const userId = UserId.fromString(uuid);
    expect(userId.toString()).toBe(uuid);
  });

  it('should return false when comparing with null or undefined', () => {
    const userId = UserId.create();
    expect(userId.equals(null as any)).toBe(false);
    expect(userId.equals(undefined as any)).toBe(false);
  });

  it('should return false when comparing with a non-UserId object', () => {
    const userId = UserId.create();
    expect(userId.equals({} as any)).toBe(false);
    expect(userId.equals('some-string' as any)).toBe(false);
  });
});