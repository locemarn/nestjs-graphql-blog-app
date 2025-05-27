/**
 * @class RegisterUserCommand
 * @description Command to register a new user.
 * Contains all necessary data to create a User aggregate.
 */
export class RegisterUserCommand {
  /**
   * @property {string} email - The email address for the new user.
   */
  public readonly email: string;

  /**
   * @property {string} password - The plain-text password for the new user.
   */
  public readonly password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
