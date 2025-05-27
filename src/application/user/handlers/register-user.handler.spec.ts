import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserHandler } from './register-user.handler';
import { RegisterUserCommand } from '../commands/register-user.command';
import { IUserRepository } from '../ports/i-user-repository';
import { User } from '@domain/user/entities/user.entity';
import { Email, UserId } from '@domain/user/value-objects';
import { UserRegisteredEvent } from '@domain/user/events';
import { EventEmitter2 } from '@nestjs/event-emitter'; // Mock this for event publishing

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let mockUserRepository: IUserRepository;
  let mockEventEmitter: EventEmitter2;

  const MOCK_DATE = new Date('2023-01-01T00:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);

    // Mock IUserRepository
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      exists: vi.fn(),
      save: vi.fn(),
    };

    // Mock EventEmitter2
    mockEventEmitter = {
      emit: vi.fn(),
      emitAsync: vi.fn(),
      // Add other methods if EventEmitter2 has them and they are used
    } as any; // Cast to any to satisfy EventEmitter2 interface

    handler = new RegisterUserHandler(mockUserRepository, mockEventEmitter);

    vi.clearAllMocks(); // Clear mocks before each test run
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully register a new user if email does not exist', async () => {
    const command = new RegisterUserCommand('newuser@example.com', 'SecurePassword123!');

    // Mock that the email does not exist
    // @ts-ignore
    (mockUserRepository.exists as vi.Mock).mockResolvedValue(false);
    // Mock User.registerNewUser to return a predictable user object
    const mockUser = {
      _id: UserId.create(),
      _email: Email.create(command.email),
      _password: { value: 'hashed_password' },
      _createdAt: MOCK_DATE,
      _updatedAt: MOCK_DATE,
      _domainEvents: [new UserRegisteredEvent(UserId.create(), Email.create(command.email), MOCK_DATE)],
      clearDomainEvents: vi.fn(),
      get userId() { return this._id; },
      get email() { return this._email; },
      get password() { return this._password; },
      get createdAt() { return this._createdAt; },
      get updatedAt() { return this._updatedAt; },
      get domainEvents() { return this._domainEvents; }
    };
    // Ensure User.registerNewUser returns a valid User instance
    vi.spyOn(User, 'registerNewUser').mockResolvedValue(mockUser as unknown as User);


    await handler.execute(command);

    // Assertions
    expect(mockUserRepository.exists).toHaveBeenCalledWith(expect.any(Email));
    expect(mockUserRepository.exists).toHaveBeenCalledWith(expect.objectContaining({ value: command.email }));
    expect(User.registerNewUser).toHaveBeenCalledWith(command.email, command.password);
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    // expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
    // expect(mockEventEmitterhaclearDomainEvents).toHaveBeenCalled();
  });

  it('should throw an error if user with email already exists', async () => {
    const command = new RegisterUserCommand('existing@example.com', 'SecurePassword123!');

    // Mock that the email already exists
    // @ts-ignore
    (mockUserRepository.exists as vi.Mock).mockResolvedValue(true);

    await expect(handler.execute(command)).rejects.toThrow('User with this email already exists.');

    // Assertions
    expect(mockUserRepository.exists).toHaveBeenCalledWith(expect.any(Email));
    expect(mockUserRepository.exists).toHaveBeenCalledWith(expect.objectContaining({ value: command.email }));
    expect(User.registerNewUser).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should handle errors during user registration', async () => {
    const command = new RegisterUserCommand('error@example.com', 'SecurePassword123!');
    const errorMessage = 'Database error during save';

    // @ts-ignore
    (mockUserRepository.exists as vi.Mock).mockResolvedValue(false);
    // @ts-ignore
    (mockUserRepository.save as vi.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(handler.execute(command)).rejects.toThrow(errorMessage);

    expect(mockUserRepository.exists).toHaveBeenCalledWith(expect.any(Email));
    expect(User.registerNewUser).toHaveBeenCalledWith(command.email, command.password);
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
});