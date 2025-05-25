import { BaseEntity, UniqueEntityID } from '@domain/shared';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { UserRegisteredEvent, UserUpdatedEvent } from '../events';

/**
 * @class User
 * @extends {BaseEntity<UserId>}
 * @description Represents the User aggregate root.
 * An aggregate root is an entity that acts as the entry point to a cluster of domain objects.
 * It ensures the consistency of the aggregate by enforcing business rules and invariants.
 */
export class User extends BaseEntity<UserId> {
  private _email: Email;
  private _password: Password;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: UserId,
    email: Email,
    password: Password,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id.value); // Pass the underlying UniqueEntityID to BaseEntity
    this._email = email;
    this._password = password;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  /**
   * Factory method to register a new User.
   * This method encapsulates the creation logic and raises a domain event.
   * @param {string} email The user's email.
   * @param {string} plainPassword The user's plain text password.
   * @returns {Promise<User>} A promise that resolves to a new User instance.
   */
  public static async registerNewUser(email: string, plainPassword: string): Promise<User> {
    const userId = UserId.create();
    const userEmail = Email.create(email);
    const userPassword = await Password.create(plainPassword);
    const now = new Date();

    const user = new User(userId, userEmail, userPassword, now, now);
    user.addDomainEvent(new UserRegisteredEvent(userId, userEmail, now, now)); // Pass occurredAt
    return user;
  }

  /**
   * Reconstitutes a User instance from existing data.
   * This method is used when loading an aggregate from persistence (e.g., event stream).
   * It does NOT raise domain events as it's recreating past state.
   * @param {string} id The user ID string.
   * @param {string} email The user's email string.
   * @param {string} hashedPassword The user's hashed password string.
   * @param {Date} createdAt The creation date.
   * @param {Date} updatedAt The last update date.
   * @returns {User} A User instance.
   */
  public static fromExisting(
    id: string,
    email: string,
    hashedPassword: string,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    const userId = UserId.fromString(id);
    const userEmail = Email.create(email);
    const userPassword = Password.fromHashed(hashedPassword);
    return new User(userId, userEmail, userPassword, createdAt, updatedAt);
  }

  /**
   * Updates the user's email address.
   * Raises a UserUpdatedEvent if the email actually changes.
   * @param {string} newEmail The new email address.
   * @returns {void}
   */
  public updateEmail(newEmail: string): void {
    const oldEmail = this._email;
    const updatedEmail = Email.create(newEmail); // Create new Email VO for validation

    if (this._email.equals(updatedEmail)) {
      return; // No change, no event
    }

    this._email = updatedEmail;
    this._updatedAt = new Date();
    this.addDomainEvent(new UserUpdatedEvent(this.userId, this._updatedAt, oldEmail, updatedEmail, this._updatedAt));
  }

  /**
   * Updates the user's password.
   * @param {string} newPlainPassword The new plain text password.
   * @returns {Promise<void>}
   */
  public async updatePassword(newPlainPassword: string): Promise<void> {
    this._password = await Password.create(newPlainPassword);
    this._updatedAt = new Date();
    // For security reasons, we generally don't include password itself in public events.
    // A UserUpdatedEvent (with only updated timestamp) is sufficient here.
    this.addDomainEvent(new UserUpdatedEvent(this.userId, this._updatedAt, undefined, undefined, this._updatedAt));
  }

  /**
   * Authenticates the user with a given plain text password.
   * @param {string} plainPassword The plain text password to check.
   * @returns {Promise<boolean>} True if the password matches, false otherwise.
   */
  public async authenticate(plainPassword: string): Promise<boolean> {
    return this._password.compare(plainPassword);
  }

  // Getters for aggregate properties
  public get userId(): UserId {
    // The BaseEntity holds the UniqueEntityID, here we return our domain-specific UserId VO
    return UserId.fromString(this.id.toValue());
  }

  public get email(): Email {
    return this._email;
  }

  public get password(): Password {
    return this._password;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}