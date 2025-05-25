import { describe, it, expect } from 'vitest';
import { ValueObject } from './value-object';

interface TestProps {
  value: string;
  count: number;
  tags?: string[];
}

class TestValueObject extends ValueObject<TestProps> {
  constructor(props: TestProps) {
    super(props);
  }

  public getValue(): string {
    return this.props.value;
  }

  public getCount(): number {
    return this.props.count;
  }
}

describe('ValueObject', () => {
  it('should be immutable after creation', () => {
    const props: TestProps = { value: 'test', count: 1 };
    const vo = new TestValueObject(props);

    console.log(vo)

    // Attempt to modify the original props object
    props.value = 'modified';
    expect(vo.getValue()).toBe('test');
    expect(vo.getCount()).toBe(1);
  });

  it('should compare two value objects with identical properties as equals', () => {
    const vo1 = new TestValueObject({ value: 'test', count: 1 });
    const vo2 = new TestValueObject({ value: 'test', count: 1 });
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should compare two value objects with different properties as unequal', () => {
    const vo1 = new TestValueObject({ value: 'apple', count: 10 });
    const vo2 = new TestValueObject({ value: 'banana', count: 10 });
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should compare two value objects with different nested properties as unequal', () => {
    const vo1 = new TestValueObject({ value: 'apple', count: 10, tags: ['red', 'fruit'] });
    const vo2 = new TestValueObject({ value: 'apple', count: 10, tags: ['green', 'fruit'] });
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should compare two value objects with identical nested properties as equal', () => {
    const vo1 = new TestValueObject({ value: 'apple', count: 10, tags: ['red', 'fruit'] });
    const vo2 = new TestValueObject({ value: 'apple', count: 10, tags: ['red', 'fruit'] });
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should handle null or undefined comparison gracefully', () => {
    const vo = new TestValueObject({ value: 'test', count: 1 });
    expect(vo.equals(null as any)).toBe(false);
    expect(vo.equals(undefined as any)).toBe(false);
  });

  it('should compare a value object to itself as equal', () => {
    const vo = new TestValueObject({ value: 'test', count: 1 });
    expect(vo.equals(vo)).toBe(true);
  });

  it('should return false if compared with a non-ValueObject instance', () => {
    const vo = new TestValueObject({ value: 'test', count: 1 });
    expect(vo.equals({ value: 'test', count: 1 } as any)).toBe(false); // Plain object
    expect(vo.equals('string' as any)).toBe(false);
  });
});