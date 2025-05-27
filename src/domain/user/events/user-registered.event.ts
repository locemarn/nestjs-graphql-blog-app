import { DomainEvent } from '@domain/shared';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';

/**
 * @class UserRegisteredEvent
 * @implements {DomainEvent}
 * @description Event fired when a new user is successfully registered.
 * This is an immutable domain event.
 */
export class UserRegisteredEvent implements DomainEvent {
  public readonly eventName: string = 'user.registered'; // Changed from 'UserRegisteredEvent'
  public readonly occurredAt: Date;
  public readonly userId: UserId;
  public readonly email: Email;
  public readonly registeredAt: Date;

  constructor(userId: UserId, email: Email, registeredAt: Date, occurredAt?: Date) {
    this.userId = userId;
    this.email = email;
    this.registeredAt = registeredAt;
    this.occurredAt = occurredAt || new Date();
  }
}
