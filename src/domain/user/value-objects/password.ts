import { ValueObject } from '@domain/shared';
import * as bcrypt from 'bcrypt';

interface PasswordProps {
  value: string; // Hashed password
}

/**
 * @class Password
 * @description Represents a user's hashed password.
 * This is a Value Object, handling password hashing and comparison.
 */
export class Password extends ValueObject<PasswordProps> {
  private constructor(props: PasswordProps) {
    super(props);
  }

  /**
   * Hashes a plain text password and creates a new Password instance.
   * @param {string} plainPassword The plain text password.
   * @returns {Promise<Password>} A promise that resolves to a new Password instance with the hashed password.
   */
  public static async create(plainPassword: string): Promise<Password> {
    if (!plainPassword) {
      throw new Error('Password cannot be empty.');
    }
    if (plainPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    const hashedPassword = await bcrypt.hash(plainPassword, 10); // 10 is the salt rounds
    return new Password({ value: hashedPassword });
  }

  /**
   * Reconstitutes a Password from a hashed string value.
   * Useful for loading from persistence.
   * @param {string} hashedPassword The hashed password string.
   * @returns {Password} A Password instance.
   */
  public static fromHashed(hashedPassword: string): Password {
    if (!hashedPassword) {
      throw new Error('Hashed password cannot be empty.');
    }
    return new Password({ value: hashedPassword });
  }

  /**
   * Compares a plain text password with the stored hashed password.
   * @param {string} plainPassword The plain text password to compare.
   * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
   */
  public async compare(plainPassword: string): Promise<boolean> {
    if (!plainPassword) {
      return false; // Cannot compare an empty plain password
    }
    return bcrypt.compare(plainPassword, this.props.value);
  }

  /**
   * Returns the hashed password string.
   * @returns {string} The hashed password as a string.
   */
  public get value(): string {
    return this.props.value;
  }

  /**
   * Returns the hashed password string.
   * @returns {string} The hashed password as a string.
   */
  public toString(): string {
    return this.props.value;
  }
}