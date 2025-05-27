import { DomainEvent } from '@domain/shared';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';

/**
 * @class UserUpdatedEvent
 * @implements {DomainEvent}
 * @description Event fired when an existing user's details are updated.
 * This is an immutable domain event.
 */
export class UserUpdatedEvent implements DomainEvent {
  public readonly eventName: string = 'user.updated';
  public readonly occurredAt: Date;
  public readonly userId: UserId;
  public readonly oldEmail?: Email;
  public readonly newEmail?: Email;
  public readonly updatedAt: Date;

  constructor(
    userId: UserId,
    updatedAt: Date,
    oldEmail?: Email,
    newEmail?: Email,
    occurredAt?: Date,
  ) {
    this.userId = userId;
    this.updatedAt = updatedAt;
    this.oldEmail = oldEmail;
    this.newEmail = newEmail;
    this.occurredAt = occurredAt || new Date();
  }
}