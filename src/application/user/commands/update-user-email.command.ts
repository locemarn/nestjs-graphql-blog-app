/**
 * @class UpdateUserEmailCommand
 * @description Command to update an existing user's email address.
 */
export class UpdateUserEmailCommand {
  /**
   * @property {string} userId - The unique identifier of the user whose email is to be updated.
   */
  public readonly userId: string;

  /**
   * @property {string} newEmail - The new email address for the user.
   */
  public readonly newEmail: string;

  constructor(userId: string, newEmail: string) {
    this.userId = userId;
    this.newEmail = newEmail;
  }
}
