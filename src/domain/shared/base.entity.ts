import { UniqueEntityID } from '@domain/shared/unique-entity-id';
import { DomainEvent } from '@domain/shared/domain-event';

/**
 * @abstract
 * @class BaseEntity
 * @description Abstract base class for all domain entities.
 * It provides a unique identifier and a mechanism to record domain events.
 */
export abstract class BaseEntity<T> {
  protected readonly _id: UniqueEntityID;
  protected _domainEvents: DomainEvent[] = [];

  constructor(id?: UniqueEntityID) {
    this._id = id ?? UniqueEntityID.create();
  }

  public get id(): UniqueEntityID {
    return this._id;
  }

  /**
   * Adds a domain event to the entity's internal list.
   * Events are typically dispatched after the aggregate is successfully persisted.
   * @param {DomainEvent} event The domain event to add.
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Clears all pending domain events from the entity.
   * Should be called after events are successfully dispatched and committed.
   */
  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Returns a read-only copy of the domain events.
   * @returns {DomainEvent[]} An array of domain events.
   */
  public get domainEvents(): DomainEvent[] {
    return [...this._domainEvents]; // Return a copy to prevent external modification
  }

  /**
   * Compares two entities for equality based on their unique ID.
   * @param {BaseEntity<any>} other The other entity to compare.
   * @returns {boolean} True if the entities are equal, false otherwise.
   */
  public equals(other: BaseEntity<any>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    if (!(other instanceof BaseEntity)) {
      return false;
    }
    return this._id.equals(other._id);
  }
}