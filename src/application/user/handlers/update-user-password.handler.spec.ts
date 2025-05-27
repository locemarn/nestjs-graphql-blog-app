import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UpdateUserPasswordHandler } from './update-user-password.handler';
import { UpdateUserPasswordCommand } from '../commands/update-user-password.command';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { User } from '@domain/user/entities/user.entity';
import { UserId } from '@domain/user/value-objects/user-id';
import { UserUpdatedEvent } from '@domain/user/events';

import { InMemoryUserRepository } from '@infrastructure/repositories/in-memory-user.repository';

import * as bcrypt from 'bcrypt';
vi.mock('bcrypt', async (importOriginal) => {
  const actual = await importOriginal<typeof bcrypt>();
  return {
    ...actual,
    hash: vi.fn((password: string) => Promise.resolve(`hashed_${password}`)),
    compare: vi.fn((password: string, hash: string) => Promise.resolve(hash === `hashed_${password}`)),
  };
});

import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
vi.mock('@domain/shared/unique-entity-id', async (importOriginal) => {
  const actualModule = await importOriginal<any>();
  return {
    UniqueEntityID: {
      create: vi.fn((value?: string) => {
        const idValue = value && uuidValidate(value) ? value : uuidv4();
        return actualModule.UniqueEntityID.create(idValue);
      }),
      fromString: vi.fn((value: string) => actualModule.UniqueEntityID.fromString(value)),
    },
  };
});


describe('UpdateUserPasswordHandler (Integration with In-Memory Repository)', () => {
  const MOCK_DATE = new Date('2023-01-01T00:00:00.000Z');
  let handler: UpdateUserPasswordHandler;
  let inMemoryUserRepository: InMemoryUserRepository;
  let mockEventEmitter: EventEmitter2;

  const initialEmail = 'user@example.com';
  const initialPlainPassword = 'OldSecurePassword123!';
  const newPlainPassword = 'NewSecurePasswordABC!';
  const samePlainPassword = 'SamePassword123!';


  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);

    inMemoryUserRepository = new InMemoryUserRepository();
    mockEventEmitter = {
      emit: vi.fn(),
      emitAsync: vi.fn().mockResolvedValue(undefined),
    } as any;

    handler = new UpdateUserPasswordHandler(inMemoryUserRepository, mockEventEmitter);



    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully update user password and emit UserUpdatedEvent', async () => {
    const user = await User.registerNewUser(initialEmail, initialPlainPassword);

    await inMemoryUserRepository.save(user);
    user.clearDomainEvents();
    expect(user.domainEvents.length).toBe(0);

    const command = new UpdateUserPasswordCommand(user.userId.toString(), newPlainPassword);

    await handler.execute(command);

    const updatedUser = await inMemoryUserRepository.findById(user.userId);
    expect(updatedUser).not.toBeNull();
    expect(updatedUser!.email.value).toBe(initialEmail);
    expect(updatedUser!.updatedAt).toEqual(MOCK_DATE);
    expect(await updatedUser!.authenticate(newPlainPassword)).toBe(true);
    expect(await updatedUser!.authenticate(initialPlainPassword)).toBe(false);

    expect(mockEventEmitter.emitAsync).toHaveBeenCalledTimes(1);

    // @ts-ignore
    const [eventName, emittedEvent] = mockEventEmitter.emitAsync.mock.calls[0];

    expect(eventName).toBe('user.updated');
    expect(emittedEvent).toBeInstanceOf(UserUpdatedEvent);


    expect(emittedEvent.userId.equals(user.userId)).toBe(true);
    expect(emittedEvent.updatedAt).toEqual(MOCK_DATE);
    expect(emittedEvent.oldEmail).toBeUndefined();
    expect(emittedEvent.newEmail).toBeUndefined();
    expect(emittedEvent.occurredAt).toEqual(MOCK_DATE);












    expect(updatedUser!.domainEvents.length).toBe(0);
  });

  it('should throw an error if user is not found', async () => {
    const nonExistentUserIdString = UserId.create().toString();
    const command = new UpdateUserPasswordCommand(nonExistentUserIdString, 'NewSecurePassword123!');

    await expect(handler.execute(command)).rejects.toThrow('User not found.');
    expect(mockEventEmitter.emitAsync).not.toHaveBeenCalled();
  });

  it('should update password and emit event even if new password is the same as current (due to updatedAt change)', async () => {
    const user = await User.registerNewUser(initialEmail, samePlainPassword);
    await inMemoryUserRepository.save(user);
    user.clearDomainEvents();

    const command = new UpdateUserPasswordCommand(user.userId.toString(), samePlainPassword);

    await handler.execute(command);

    const updatedUser = await inMemoryUserRepository.findById(user.userId);
    expect(updatedUser).not.toBeNull();
    expect(await updatedUser!.authenticate(samePlainPassword)).toBe(true);
    expect(updatedUser!.updatedAt).toEqual(MOCK_DATE);

    expect(mockEventEmitter.emitAsync).toHaveBeenCalledTimes(1);

    // @ts-ignore
    const [eventName, emittedEvent] = mockEventEmitter.emitAsync.mock.calls[0];

    expect(eventName).toBe('user.updated');
    expect(emittedEvent).toBeInstanceOf(UserUpdatedEvent);

    expect(emittedEvent.userId.equals(user.userId)).toBe(true);
    expect(emittedEvent.updatedAt).toEqual(MOCK_DATE);
    expect(emittedEvent.oldEmail).toBeUndefined();
    expect(emittedEvent.newEmail).toBeUndefined();

    expect(updatedUser!.domainEvents.length).toBe(0);
  });
});
