import * as R from 'ramda';

/**
 * @abstract
 * @class ValueObject
 * @description Abstract base class for all domain Value Objects.
 * Value Objects are immutable and are defined by their attributes.
 * They are compared by value, not by reference.
 */
export abstract class ValueObject<T> {
  protected constructor(protected readonly props: T) {
    this.props = Object.freeze({ ...props });
  }

  /**
   * Compares two Value Objects for equality.
   * Uses deep comparison of their properties.
   * @param {ValueObject<T>} other The other Value Object to compare.
   * @returns {boolean} True if the Value Objects are equal, false otherwise.
   */
  public equals(other?: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    if (!(other instanceof ValueObject)) {
      return false;
    }

    // Use Ramda for deep equality comparison of props
    return R.equals(this.props, other.props);
  }
}
