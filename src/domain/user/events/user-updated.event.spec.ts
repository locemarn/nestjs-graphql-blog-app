import { describe, it, expect, vi } from 'vitest';
import { UserUpdatedEvent } from './user-updated.event';
import { UserId, Email } from '../value-objects';
import { UniqueEntityID } from '@domain/shared';

describe('UserUpdatedEvent', () => {
  const userId = UserId.fromString('123e4567-e89b-12d3-a456-426655440000');
  const oldEmail = Email.create('old@example.com');
  const newEmail = Email.create('new@example.com');
  const updatedAt = new Date('2023-01-02T10:00:00.000Z');

  it('should correctly initialize with userId and update timestamp', () => {
    const event = new UserUpdatedEvent(userId, updatedAt);

    expect(event).toBeInstanceOf(UserUpdatedEvent);
    expect(event.eventName).toBe('UserUpdatedEvent');
    expect(event.userId).toBe(userId);
    expect(event.updatedAt).toBe(updatedAt);
    expect(event.oldEmail).toBeUndefined();
    expect(event.newEmail).toBeUndefined();
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should correctly initialize with old and new email provided', () => {
    const event = new UserUpdatedEvent(userId, updatedAt, oldEmail, newEmail);

    expect(event.oldEmail).toBe(oldEmail);
    expect(event.newEmail).toBe(newEmail);
  });

  it('should have a distinct event name', () => {
    const event = new UserUpdatedEvent(userId, updatedAt);
    expect(event.eventName).toBe('UserUpdatedEvent');
  });

  it('should set occurredAt to a Date instance', () => {
    const event = new UserUpdatedEvent(userId, updatedAt);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should have an occurredAt close to the current time if not explicitly passed', () => {
    vi.useFakeTimers();
    const now = new Date('2023-01-02T11:00:00.000Z');
    vi.setSystemTime(now);

    const event = new UserUpdatedEvent(userId, updatedAt);
    expect(event.occurredAt.toISOString()).toBe(now.toISOString());

    vi.useRealTimers();
  });
});