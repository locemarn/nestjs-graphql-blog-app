import { Inject } from '@nestjs/common';
import { RegisterUserCommand } from '../commands/register-user.command';
import { IUserRepository } from '../ports/i-user-repository';
import { User } from '@domain/user/entities/user.entity';
import { Email, UserId } from '@domain/user/value-objects';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * @class RegisterUserHandler
 * @description Handles the RegisterUserCommand, orchestrating the creation of a new User.
 */
export class RegisterUserHandler {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * @method execute
   * @param {RegisterUserCommand} command - The command to execute.
   * @returns {Promise<UserId>} The UserId of the newly registered user.
   * @throws {Error} If a user with the given email already exists.
   */
  public async execute(command: RegisterUserCommand): Promise<UserId> {
    const email = Email.create(command.email); // Create Email Value Object

    // Check if user with this email already exists
    const userExists = await this.userRepository.exists(email);
    if (userExists) {
      throw new Error('User with this email already exists.');
    }

    // Register new user (domain logic encapsulated in aggregate)
    const user = await User.registerNewUser(command.email, command.password);

    // Save the user (persisting the aggregate and its events)
    await this.userRepository.save(user);

    // Publish domain events
    for (const event of user.domainEvents) {
      await this.eventEmitter.emitAsync(event.eventName, event);
    }
    user.clearDomainEvents(); // Clear events after successful publishing

    return user.userId;
  }
}
