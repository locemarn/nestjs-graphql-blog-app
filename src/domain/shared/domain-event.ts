/**
 * @interface DomainEvent
 * @description Interface for all domain events.
 * Ensures that events have a name and a timestamp.
 */
export interface DomainEvent {
  readonly eventName: string;
  readonly occurredAt: Date;
  // Add other common properties if needed, e.g., correlationId, causationId
}