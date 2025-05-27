import { ValueObject } from '../../shared';

interface EmailProps {
  value: string;
}

/**
 * @class Email
 * @description Represents a user's email address.
 * This is a Value Object, ensuring email format validity and immutability.
 */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  /**
   * Validates the email format using a simple regex.
   * @param {string} email The email string to validate.
   * @returns {boolean} True if the email is valid, false otherwise.
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Creates a new Email instance.
   * @param {string} value The email string.
   * @returns {Email} A new Email instance.
   */
  public static create(value: string): Email {
    if (!value) {
      throw new Error('Email cannot be empty.');
    }
    const lowercasedEmail = value.toLowerCase();
    if (!Email.isValidEmail(lowercasedEmail)) {
      throw new Error('Invalid email format.');
    }
    const e = new Email({ value: lowercasedEmail });
    return new Email({ value: lowercasedEmail });
  }

  /**
   * Returns the string representation of the Email.
   * @returns {string} The Email as a string.
   */
  public get value(): string {
    return this.props.value;
  }

  /**
   * Returns the string representation of the Email.
   * @returns {string} The Email as a string.
   */
  public toString(): string {
    return this.props.value;
  }
}