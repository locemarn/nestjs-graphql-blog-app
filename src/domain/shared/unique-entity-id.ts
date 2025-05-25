import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

/**
 * @class UniqueEntityID
 * @description Represents a unique identifier for a domain entity.
 * This is a Value Object, meaning it is immutable and compared by its value.
 */
export class UniqueEntityID {
  private readonly _value: string;

  private constructor(value?: string) {
    if (value && !uuidValidate(value)) {
      throw new Error('Invalid UUID format for UniqueEntityID.');
    }
    this._value = value || uuidv4();
  }

  /**
   * Creates a new UniqueEntityID instance with a generated UUID or from a string.
   * @param {string} [value] Optional string value for the ID. If not provided, a new UUID is generated.
   * @returns {UniqueEntityID} A new UniqueEntityID instance.
   */
  public static create(value?: string): UniqueEntityID {
    return new UniqueEntityID(value);
  }

  /**
   * Returns the string representation of the UniqueEntityID.
   * @returns {string} The UUID as a string.
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Compares two UniqueEntityID instances for equality.
   * @param {UniqueEntityID} other The other UniqueEntityID instance to compare.
   * @returns {boolean} True if the UniqueEntityID instances are equal, false otherwise.
   */
  public equals(other: UniqueEntityID): boolean {
    if (!(other instanceof UniqueEntityID)) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * Returns the primitive value of the UniqueEntityID.
   * @returns {string} The UUID as a string.
   */
  public toValue(): string {
    return this._value;
  }
}
