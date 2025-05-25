import { UniqueEntityID, ValueObject } from '@domain/shared';

interface UserIdProps {
  value: UniqueEntityID
}

/**
 * @class UserId
 * @description Represents the unique identifier for a User.
 * This is a Value Object wrapping UniqueEntityID.
 */
export class UserId extends ValueObject<UserIdProps> {
  private constructor(props: UserIdProps) {
    super(props);
  }

  /**
   * Creates a new UserId instance with a generated UUID.
   * @returns {UserId} A new UserId instance.
   */
  public static create(): UserId {
    return new UserId({ value: UniqueEntityID.create() });
  }

  /**
   * Creates a UserId from an existing UUID string.
   * @param {string} uuid The string representation of the UserId.
   * @returns {UserId} A UserId instance.
   */
  public static fromString(uuid: string): UserId {
    return new UserId({ value: UniqueEntityID.create(uuid) });
  }

  /**
   * Returns the underlying UniqueEntityID value.
   * @returns {UniqueEntityID} The UniqueEntityID.
   */
  public get value(): UniqueEntityID {
    return this.props.value;
  }

  /**
   * Returns the string representation of the UserId.
   * @returns {string} The UserId as a string.
   */
  public toString(): string {
    return this.props.value.toValue();
  }
}
