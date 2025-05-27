import { User } from '@domain/user/entities/user.entity';
import { UserId } from '@domain/user/value-objects';
import { Email } from '@domain/user/value-objects/email'; // Ensure Email is imported

/**
 * @interface IUserRepository
 * @description Defines the contract for interacting with user persistence.
 * This is an application layer "port" (interface) that abstracts database operations.
 */
export interface IUserRepository {
  /**
   * @method findById
   * @param {UserId} userId - The unique identifier of the user.
   * @returns {Promise<User | null>} The User aggregate if found, otherwise null.
   */
  findById(userId: UserId): Promise<User | null>;

  /**
   * @method findByEmail
   * @param {Email} email - The email address of the user.
   * @returns {Promise<User | null>} The User aggregate if found, otherwise null.
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * @method exists
   * @param {Email} email - The email address to check for existence.
   * @returns {Promise<boolean>} True if a user with the given email exists, false otherwise.
   */
  exists(email: Email): Promise<boolean>;

  /**
   * @method save
   * @param {User} user - The User aggregate to be saved or updated.
   * @returns {Promise<void>} A promise that resolves when the user is saved.
   */
  save(user: User): Promise<void>;
}
