import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UpdateUserEmailHandler } from './update-user-email.handler';
import { UpdateUserEmailCommand } from '../commands/update-user-email.command';
import { IUserRepository } from '../ports/i-user-repository';
import { User } from '@domain/user/entities/user.entity';
import { Email, UserId, Password } from '@domain/user/value-objects';
import { UserUpdatedEvent } from '@domain/user/events';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('UpdateUserEmailHandler', () => {
  let handler: UpdateUserEmailHandler;
  let mockUserRepository: IUserRepository;
  let mockEventEmitter: EventEmitter2;

  const MOCK_DATE = new Date('2023-01-01T00:00:00.000Z');
  const existingUserId = UserId.fromString('123e4567-e89b-12d3-a456-426655440000');
  const existingUserEmail = Email.create('existing@example.com');
  const existingUserPassword = Password.fromHashed('hashed_password');
  let mockUser: User;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);

    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      exists: vi.fn(),
      save: vi.fn(),
    };

    mockEventEmitter = {
      emit: vi.fn(),
      emitAsync: vi.fn(),
    } as any;

    // Create a mock User instance that can be modified by the handler
    mockUser = User.fromExisting(
      existingUserId.toString(),
      existingUserEmail.toString(),
      existingUserPassword.toString(),
      new Date('2022-01-01T00:00:00.000Z'), // Older creation date
      new Date('2022-01-01T00:00:00.000Z')  // Older update date
    );
    // Spy on the actual methods of the mockUser to track calls
    vi.spyOn(mockUser, 'updateEmail');
    vi.spyOn(mockUser, 'clearDomainEvents');
    // REMOVED: Object.defineProperty(mockUser, 'domainEvents', { get: vi.fn(() => []), configurable: true, });
    // This was preventing domain events from being correctly added to the mockUser instance.


    handler = new UpdateUserEmailHandler(mockUserRepository, mockEventEmitter);

    vi.clearAllMocks(); // Clear mocks before each test run
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully update user email and emit UserUpdatedEvent', async () => {
    const command = new UpdateUserEmailCommand(existingUserId.toString(), 'new@example.com');

    // Mock findById to return the existing user
    // @ts-ignore
    (mockUserRepository.findById as vi.Mock).mockResolvedValue(mockUser);
    // Mock exists to return false for the new email
    // @ts-ignore
    (mockUserRepository.exists as vi.Mock).mockResolvedValue(false);

    // REMOVED: (Object.getOwnPropertyDescriptor(mockUser, 'domainEvents')?.get as vi.Mock).mockReturnValueOnce([...]);
    // The real `updateEmail` method will now correctly add the event to `mockUser._domainEvents`,
    // and the `domainEvents` getter will naturally return it.

    await handler.execute(command);

    // Assertions
    expect(mockUserRepository.findById).toHaveBeenCalledWith(expect.any(UserId));
    expect(mockUserRepository.findById).toHaveBeenCalledWith(expect.objectContaining({ value: existingUserId.value }));
    expect(mockUserRepository.exists).toHaveBeenCalledWith(expect.any(Email));
    expect(mockUserRepository.exists).toHaveBeenCalledWith(expect.objectContaining({ value: command.newEmail }));
    expect(mockUser.updateEmail).toHaveBeenCalledWith(command.newEmail);
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser); // This should now pass
    expect(mockEventEmitter.emitAsync).toHaveBeenCalledTimes(1); // Changed to emitAsync
    expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith( // Changed to emitAsync
      'user.updated',
      expect.any(UserUpdatedEvent)
    );
    expect(mockUser.clearDomainEvents).toHaveBeenCalled();
  });

  it('should throw an error if user is not found', async () => {
    const command = new UpdateUserEmailCommand(existingUserId.toString(), 'new@example.com');

    // @ts-ignore
    (mockUserRepository.findById as vi.Mock).mockResolvedValue(null); // User not found

    await expect(handler.execute(command)).rejects.toThrow('User not found.');

    expect(mockUserRepository.findById).toHaveBeenCalledWith(expect.any(UserId));
    expect(mockUserRepository.exists).not.toHaveBeenCalled();
    expect(mockUser.updateEmail).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockEventEmitter.emitAsync).not.toHaveBeenCalled(); // Changed to emitAsync
  });

  it('should throw an error if new email already exists for another user', async () => {
    const command = new UpdateUserEmailCommand(existingUserId.toString(), 'taken@example.com');

    // @ts-ignore
    (mockUserRepository.findById as vi.Mock).mockResolvedValue(mockUser);
    // @ts-ignore
    (mockUserRepository.exists as vi.Mock).mockResolvedValue(true); // New email exists

    await expect(handler.execute(command)).rejects.toThrow('Email already in use by another user.');

    expect(mockUserRepository.findById).toHaveBeenCalledWith(expect.any(UserId));
    expect(mockUserRepository.exists).toHaveBeenCalledWith(expect.any(Email));
    expect(mockUser.updateEmail).not.toHaveBeenCalled(); // Email update should not be attempted
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockEventEmitter.emitAsync).not.toHaveBeenCalled(); // Changed to emitAsync
  });

  it('should not update email or emit event if new email is the same as current', async () => {
    const command = new UpdateUserEmailCommand(existingUserId.toString(), existingUserEmail.toString());

    // @ts-ignore
    (mockUserRepository.findById as vi.Mock).mockResolvedValue(mockUser);
    // Mock exists to return false, but the domain logic should prevent update anyway
    // @ts-ignore
    (mockUserRepository.exists as vi.Mock).mockResolvedValue(false);

    // Ensure updateEmail doesn't add an event if email is the same
    // We need to explicitly mock the behavior of updateEmail here for this specific test
    // to ensure it does NOT add an event.
    // @ts-ignore
    (mockUser.updateEmail as vi.Mock).mockImplementation(function(this: User, newEmailValue: string) {
      // Simulate no change in email, so no event is added to _domainEvents
      // The internal _domainEvents array remains empty for this mock call.
      // We don't need to touch the getter here.
    });


    await handler.execute(command);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(expect.any(UserId));
    expect(mockUserRepository.exists).toHaveBeenCalledWith(expect.any(Email));
    expect(mockUser.updateEmail).toHaveBeenCalledWith(command.newEmail); // Method is still called
    expect(mockUserRepository.save).not.toHaveBeenCalled(); // No save if no change
    expect(mockEventEmitter.emitAsync).not.toHaveBeenCalled(); // Changed to emitAsync
    expect(mockUser.clearDomainEvents).not.toHaveBeenCalled(); // No events to clear
  });
});