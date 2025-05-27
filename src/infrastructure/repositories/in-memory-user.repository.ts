import { IUserRepository } from '@application/user/ports/i-user-repository';
import { User } from '@domain/user/entities/user.entity';
import { UserId } from '@domain/user/value-objects/user-id';
import { Email } from '@domain/user/value-objects/email';

/**
 * @class InMemoryUserRepository
 * @implements {IUserRepository}
 * @description In-memory implementation of IUserRepository for testing and local development.
 * Stores User aggregates in a Map.
 */
export class InMemoryUserRepository implements IUserRepository {
  // A Map to simulate a database table, storing User objects by their ID string.
  private users = new Map<string, User>();

  /**
   * @method findById
   * @param {UserId} userId - The unique identifier of the user to find.
   * @returns {Promise<User | null>} The User aggregate if found, otherwise null.
   */
  async findById(userId: UserId): Promise<User | null> {
    return this.users.get(userId.toString()) || null;
  }

  /**
   * @method findByEmail
   * @param {Email} email - The email address of the user to find.
   * @returns {Promise<User | null>} The User aggregate if found, otherwise null.
   */
  async findByEmail(email: Email): Promise<User | null> {
    // Iterate through stored users to find by email.
    // In a real database, this would be an indexed query.
    for (const user of this.users.values()) {
      if (user.email.equals(email)) {
        return user;
      }
    }
    return null;
  }

  /**
   * @method exists
   * @param {Email} email - The email address to check for existence.
   * @returns {Promise<boolean>} True if a user with the given email exists, false otherwise.
   */
  async exists(email: Email): Promise<boolean> {
    // Check if any user in the map has the given email.
    for (const user of this.users.values()) {
      if (user.email.equals(email)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @method save
   * @param {User} user - The User aggregate to be saved or updated.
   * @returns {Promise<void>} A promise that resolves when the user is saved.
   */
  async save(user: User): Promise<void> {
    // Store or update the user in the map.
    this.users.set(user.userId.toString(), user);
  }
}
