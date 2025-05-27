import { describe, it, expect, vi } from 'vitest';
import { UserRegisteredEvent } from './user-registered.event';
import { UserId, Email } from '../value-objects';
import { UniqueEntityID } from '@domain/shared'

describe('UserRegisteredEvent', () => {
  const userId = UserId.fromString('123e4567-e89b-12d3-a456-426655440000');
  const email = Email.create('test@example.com');
  const registeredAt = new Date('2023-01-01T10:00:00.000Z');

  it('should correctly initialize with provided data', () => {
    const event = new UserRegisteredEvent(userId, email, registeredAt);

    expect(event).toBeInstanceOf(UserRegisteredEvent);
    expect(event.eventName).toBe('user.registered');
    expect(event.userId).toBe(userId);
    expect(event.email).toBe(email);
    expect(event.registeredAt).toBe(registeredAt);
    expect(event.occurredAt).toBeInstanceOf(Date); // occurredAt is set in the constructor
  });

  it('should have a distinct event name', () => {
    const event = new UserRegisteredEvent(userId, email, registeredAt);
    expect(event.eventName).toBe('user.registered');
  });

  it('should set occurredAt to a Date instance', () => {
    const event = new UserRegisteredEvent(userId, email, registeredAt);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should have an occurredAt close to the current time if not explicitly passed', () => {
    vi.useFakeTimers(); // Mock Date to control time
    const now = new Date('2023-01-01T11:00:00.000Z');
    vi.setSystemTime(now);

    const event = new UserRegisteredEvent(userId, email, registeredAt);
    expect(event.occurredAt.toISOString()).toBe(now.toISOString());

    vi.useRealTimers(); // Restore Date
  });
});