import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { User } from './user.entity';
import { UserId, Email, Password } from '../value-objects';
import { UserRegisteredEvent, UserUpdatedEvent } from '../events';
import { UniqueEntityID } from '@domain/shared';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import * as bcrypt from 'bcrypt';

vi.mock('@domain/shared/unique-entity-id', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@domain/shared/unique-entity-id')>();
  return {
    UniqueEntityID: {
      create: vi.fn((value?: string) => {
        const idValue = value && uuidValidate(value) ? value : uuidv4();
        return actual.UniqueEntityID.create(idValue);
      }),
    },
  };
});

vi.mock('bcrypt', async (importOriginal) => {
  const actual = await importOriginal<typeof bcrypt>();
  return {
    ...actual,
    hash: vi.fn((password: string) => Promise.resolve(`hashed_${password}`)),
    compare: vi.fn((password: string, hash: string) => Promise.resolve(hash === `hashed_${password}`)),
  };
});

describe('User Aggregate Root', () => {
  const MOCK_DATE = new Date('2023-01-01T00:00:00.000Z');
  let emailCreateSpy: ReturnType<typeof vi.spyOn>;
  let passwordCreateSpy: ReturnType<typeof vi.spyOn>;
  let passwordFromHashedSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
    vi.clearAllMocks();

    emailCreateSpy = vi.spyOn(Email, 'create').mockImplementation((value: string) => {
      const instance = {
        value: value.toLowerCase(),
        toString: () => value.toLowerCase(),
        equals: (other: any) => other?.value === value.toLowerCase(),
      };

      Object.setPrototypeOf(instance, Email.prototype);
      return instance as Email;
    });

    passwordCreateSpy = vi.spyOn(Password, 'create').mockImplementation(async (plainPassword: string) => {
      const instance = {
        value: `hashed_${plainPassword}`,
        toString: () => `hashed_${plainPassword}`,

        compare: (p: string) => bcrypt.compare(p, `hashed_${plainPassword}`),
        equals: (other: any) => other?.value === `hashed_${plainPassword}`,
      };
      Object.setPrototypeOf(instance, Password.prototype);
      return instance as Password;
    });

    passwordFromHashedSpy = vi.spyOn(Password, 'fromHashed').mockImplementation((hashedPassword: string) => {
      const instance = {
        value: hashedPassword,
        toString: () => hashedPassword,
        compare: (p: string) => bcrypt.compare(p, hashedPassword),
        equals: (other: any) => other?.value === hashedPassword,
      };
      Object.setPrototypeOf(instance, Password.prototype);
      return instance as Password;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    emailCreateSpy.mockRestore();
    passwordCreateSpy.mockRestore();
    passwordFromHashedSpy.mockRestore();
  });

  it('should successfully register a new user and raise UserRegisteredEvent', async () => {
    const emailString = 'newuser@example.com';
    const plainPassword = 'NewSecurePassword123!';

    const user = await User.registerNewUser(emailString, plainPassword);

    expect(user).toBeInstanceOf(User);
    expect(user.userId).toBeInstanceOf(UserId);
    expect(user.email).toBeInstanceOf(Email);
    expect(user.email.value).toBe(emailString.toLowerCase());
    expect(user.password).toBeInstanceOf(Password);
    expect(user.password.value).toBe(`hashed_${plainPassword}`);
    expect(user.createdAt).toEqual(MOCK_DATE);
    expect(user.updatedAt).toEqual(MOCK_DATE);

    expect(user.domainEvents.length).toBe(1);
    const event = user.domainEvents[0] as UserRegisteredEvent;
    expect(event).toBeInstanceOf(UserRegisteredEvent);
    expect(event.userId.toString()).toBe(user.userId.toString());
    expect(event.email.value).toBe(user.email.value);
    expect(event.registeredAt).toEqual(MOCK_DATE);
    expect(event.occurredAt).toEqual(MOCK_DATE);

    expect(emailCreateSpy).toHaveBeenCalledWith(emailString);
    expect(passwordCreateSpy).toHaveBeenCalledWith(plainPassword);
  });

  it('should reconstitute a User from existing data without raising events', () => {
    const id = uuidv4();
    const email = 'existing@example.com';
    const hashedPassword = 'existingHashedPassword';
    const createdAt = new Date('2022-01-01T00:00:00.000Z');
    const updatedAt = new Date('2022-01-01T00:00:00.000Z');

    const user = User.fromExisting(id, email, hashedPassword, createdAt, updatedAt);

    expect(user).toBeInstanceOf(User);
    expect(user.userId).toBeInstanceOf(UserId);
    expect(user.userId.toString()).toBe(id);
    expect(user.email).toBeInstanceOf(Email);
    expect(user.email.value).toBe(email);
    expect(user.password).toBeInstanceOf(Password);
    expect(user.password.value).toBe(hashedPassword);
    expect(user.createdAt).toEqual(createdAt);
    expect(user.updatedAt).toEqual(updatedAt);
    expect(user.domainEvents.length).toBe(0);
  });

  it('should update user email and raise UserUpdatedEvent', async () => {
    const user = await User.registerNewUser('old@example.com', 'Password123!');
    user.clearDomainEvents();

    const newEmailString = 'updated@example.com';
    user.updateEmail(newEmailString);

    expect(user.email).toBeInstanceOf(Email);
    expect(user.email.value).toBe(newEmailString.toLowerCase());
    expect(user.updatedAt).toEqual(MOCK_DATE);

    expect(user.domainEvents.length).toBe(1);
    const event = user.domainEvents[0] as UserUpdatedEvent;
    expect(event).toBeInstanceOf(UserUpdatedEvent);
    expect(event.userId.toString()).toBe(user.userId.toString());
    expect(event.oldEmail).toBeInstanceOf(Email);
    expect(event.oldEmail?.value).toBe('old@example.com');
    expect(event.newEmail).toBeInstanceOf(Email);
    expect(event.newEmail?.value).toBe(newEmailString.toLowerCase());
    expect(event.updatedAt).toEqual(MOCK_DATE);
    expect(event.occurredAt).toEqual(MOCK_DATE);
  });

  it('should not raise UserUpdatedEvent if email is not changed', async () => {
    const user = await User.registerNewUser('same@example.com', 'Password123!');
    user.clearDomainEvents();

    const sameEmailString = 'same@example.com';
    user.updateEmail(sameEmailString);

    expect(user.domainEvents.length).toBe(0);

    expect(user.updatedAt).toEqual(MOCK_DATE);
  });

  it('should update user password', async () => {
    const user = await User.registerNewUser('user@example.com', 'OldPassword123!');
    user.clearDomainEvents();

    const newPlainPassword = 'NewStrongPassword123!';
    await user.updatePassword(newPlainPassword);

    expect(user.password).toBeInstanceOf(Password);
    expect(user.password.value).toBe(`hashed_${newPlainPassword}`);
    expect(user.updatedAt).toEqual(MOCK_DATE);

    expect(user.domainEvents.length).toBe(1);
    const event = user.domainEvents[0] as UserUpdatedEvent;
    expect(event).toBeInstanceOf(UserUpdatedEvent);
    expect(event.userId.toString()).toBe(user.userId.toString());
    expect(event.oldEmail).toBeUndefined();
    expect(event.newEmail).toBeUndefined();
    expect(event.updatedAt).toEqual(MOCK_DATE);
    expect(event.occurredAt).toEqual(MOCK_DATE);
  });

  it('should authenticate user with correct password', async () => {
    const user = await User.registerNewUser('auth@example.com', 'AuthPassword123!');
    const isAuthenticated = await user.authenticate('AuthPassword123!');
    expect(isAuthenticated).toBe(true);
  });

  it('should not authenticate user with incorrect password', async () => {
    const user = await User.registerNewUser('auth@example.com', 'AuthPassword123!');
    const isAuthenticated = await user.authenticate('WrongPassword!');
    expect(isAuthenticated).toBe(false);
  });

  it('should clear domain events', async () => {
    const user = await User.registerNewUser('clear@example.com', 'Password123!');
    expect(user.domainEvents.length).toBeGreaterThan(0);
    user.clearDomainEvents();
    expect(user.domainEvents.length).toBe(0);
  });
});