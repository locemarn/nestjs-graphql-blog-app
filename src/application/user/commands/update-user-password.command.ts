/**
 * @class UpdateUserPasswordCommand
 * @description Command to update an existing user's password.
 */
export class UpdateUserPasswordCommand {
  /**
   * @property {string} userId - The unique identifier of the user whose password is to be updated.
   */
  public readonly userId: string;

  /**
   * @property {string} newPassword - The new plain-text password for the user.
   */
  public readonly newPassword: string;

  constructor(userId: string, newPassword: string) {
    this.userId = userId;
    this.newPassword = newPassword;
  }
}
