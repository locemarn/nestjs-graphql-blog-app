import { describe, it, expect } from 'vitest';
import { UniqueEntityID } from '@domain/shared/unique-entity-id';
import { validate as uuidValidate } from 'uuid';

describe('UniqueEntityID', () => {
  it('should create a UniqueEntityID with a generated UUID if no value is provided', () => {
    const id = UniqueEntityID.create();
    expect(id).toBeDefined();
    expect(id).toBeInstanceOf(UniqueEntityID);
    expect(uuidValidate(id.toString())).toBe(true);
  });

  it('should create a UniqueEntityID from a valid UUID string', () => {
    const uuid = '123e4567-e89b-12d3-a456-426655440000';
    const id = UniqueEntityID.create(uuid);
    expect(id).toBeDefined();
    expect(id).toBeInstanceOf(UniqueEntityID);
    expect(id.toString()).toBe(uuid);
  })

  it('should thrown an error if an invalid UUID string is provided', () => {
    const invalidUUID = 'not-a-valid-uuid';
    expect(() => UniqueEntityID.create(invalidUUID)).toThrow('Invalid UUID format for UniqueEntityID.');
  });

  it('should return the string representation of the UUID', () => {
    const uuid = '123e4567-e89b-12d3-a456-426655440000';
    const id = UniqueEntityID.create(uuid);
    expect(id.toString()).toBe(uuid);
  });

  it('should return the primitive value of the UUID', () => {
    const uuid = '123e4567-e89b-12d3-a456-426655440000';
    const id = UniqueEntityID.create(uuid);
    expect(id.toValue()).toBe(uuid);
  });

  it('should compare two UniqueEntityID instances for equality (same value)', () => {
    const uuid = '123e4567-e89b-12d3-a456-426655440000';
    const id1 = UniqueEntityID.create(uuid);
    const id2 = UniqueEntityID.create(uuid);
    expect(id1.equals(id2)).toBe(true);
  });

  it('should compare two UniqueEntityID instances for inequality (different value)', () => {
    const id1 = UniqueEntityID.create('123e4567-e89b-12d3-a456-426655440000');
    const id2 = UniqueEntityID.create('123e4567-e89b-12d3-a456-426655440002');
    expect(id1.equals(id2)).toBe(false);
  });

  it('should compare UniqueEntityID with a non-UniqueEntityID object for inequality', () => {
    const id = UniqueEntityID.create();
    expect(id.equals(null as any)).toBe(false);
    expect(id.equals(undefined as any)).toBe(false);
    expect(id.equals('some-string' as any)).toBe(false);
    expect(id.equals({ value: id.toString() } as any)).toBe(false); // Different type
  });

  it('should be equal to itself', () => {
    const id = UniqueEntityID.create();
    expect(id.equals(id)).toBe(true);
  });
})

