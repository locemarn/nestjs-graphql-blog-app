import { Inject } from '@nestjs/common';
import { UpdateUserEmailCommand } from '../commands/update-user-email.command';
import { IUserRepository } from '../ports/i-user-repository';
import { UserId, Email } from '@domain/user/value-objects';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * @class UpdateUserEmailHandler
 * @description Handles the UpdateUserEmailCommand, orchestrating the update of a user's email.
 */
export class UpdateUserEmailHandler {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * @method execute
   * @param {UpdateUserEmailCommand} command - The command to execute.
   * @returns {Promise<void>} A promise that resolves when the email is updated.
   * @throws {Error} If the user is not found or the new email is already in use.
   */
  public async execute(command: UpdateUserEmailCommand): Promise<void> {
    const userId = UserId.fromString(command.userId);
    const newEmail = Email.create(command.newEmail);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }


    const emailAlreadyExists = await this.userRepository.exists(newEmail);
    if (emailAlreadyExists && !user.email.equals(newEmail)) {
      throw new Error('Email already in use by another user.');
    }

    // Update email (domain logic encapsulated in aggregate)
    const initialDomainEventsCount = user.domainEvents.length;
    user.updateEmail(command.newEmail);

    // Only save and publish events if the email was actually changed and an event was raised
    if (user.domainEvents.length > initialDomainEventsCount) {
      await this.userRepository.save(user);

      for (const event of user.domainEvents) {
        await this.eventEmitter.emitAsync(event.eventName, event);
      }
      user.clearDomainEvents();
    }
  }
}