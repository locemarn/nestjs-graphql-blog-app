import { Inject } from '@nestjs/common';
import { UpdateUserPasswordCommand } from '../commands/update-user-password.command';
import { IUserRepository } from '../ports/i-user-repository';
import { UserId } from '@domain/user/value-objects';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * @class UpdateUserPasswordHandler
 * @description Handles the UpdateUserPasswordCommand, orchestrating the update of a user's password.
 */
export class UpdateUserPasswordHandler {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * @method execute
   * @param {UpdateUserPasswordCommand} command - The command to execute.
   * @returns {Promise<void>} A promise that resolves when the password is updated.
   * @throws {Error} If the user is not found.
   */
  public async execute(command: UpdateUserPasswordCommand): Promise<void> {
    const userId = UserId.fromString(command.userId);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    // Update password (domain logic encapsulated in aggregate)
    const initialDomainEventsCount = user.domainEvents.length;
    await user.updatePassword(command.newPassword);

    // Only save and publish events if the password was actually changed and an event was raised
    // (User.updatePassword currently always raises UserUpdatedEvent for timestamp change)
    if (user.domainEvents.length > initialDomainEventsCount) {
      await this.userRepository.save(user);

      for (const event of user.domainEvents) {
        await this.eventEmitter.emitAsync(event.eventName, event);
      }
      user.clearDomainEvents();
    }
  }
}
