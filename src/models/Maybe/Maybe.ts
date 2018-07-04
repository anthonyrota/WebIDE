export abstract class Maybe<T> {
  protected constructor() {}

  public static fromNullable<T>(valueOrNull: T | null | undefined): Maybe<T> {
    return valueOrNull == null ? new None<T>() : new Some<T>(valueOrNull)
  }

  public static fromNonNullable<T>(
    valueOrNull: T | null | undefined
  ): Maybe<T> {
    if (valueOrNull == null) {
      throw new TypeError('value is null')
    }
    return new Some<T>(valueOrNull)
  }

  public static none<T>(): Maybe<T> {
    return new None<T>()
  }

  public static some<T>(value: T): Maybe<T> {
    return new Some<T>(value)
  }

  public abstract isEmpty(): boolean
  public abstract hasValue(): boolean
  public abstract withValue(action: (value: T) => void): void
  public abstract or(maybe: Maybe<T>): Maybe<T>
  public abstract orGet(getMaybe: () => Maybe<T>): Maybe<T>
  public abstract orElse(value: T): Maybe<T>
  public abstract orElseGet(getValue: () => T): Maybe<T>
  public abstract getOrElse(value: T): T
  public abstract getOrElseComputed(getValue: () => T): T
  public abstract match<U>(outcomes: {
    some: (value: T) => U
    none: () => U
  }): U
  public abstract map<U>(transform: (value: T) => U): Maybe<U>
  public abstract flatMap<U>(transform: (value: T) => Maybe<U>): Maybe<U>
  public abstract filter(predicate: (value: T) => boolean): Maybe<T>
  public abstract getOrThrow(): T
  public abstract getOrThrowError(error: any): T
  public abstract getOrThrowComputedError(getError: () => any): T
}

class Some<T> extends Maybe<T> {
  private __value: T

  constructor(value: T) {
    super()
    this.__value = value
  }

  public isEmpty(): boolean {
    return false
  }

  public hasValue(): boolean {
    return true
  }

  public withValue(action: (value: T) => void): void {
    action(this.__value)
  }

  public or(maybe: Maybe<T>): Maybe<T> {
    return this
  }

  public orGet(getMaybe: () => Maybe<T>): Maybe<T> {
    return this
  }

  public orElse(value: T): Maybe<T> {
    return this
  }

  public orElseGet(getValue: () => T): Maybe<T> {
    return this
  }

  public getOrElse(value: T): T {
    return this.__value
  }

  public getOrElseComputed(getValue: () => T): T {
    return this.__value
  }

  public match<U>(outcomes: { some: (value: T) => U; none: () => U }): U {
    return outcomes.some(this.__value)
  }

  public map<U>(transform: (value: T) => U): Maybe<U> {
    return new Some(transform(this.__value))
  }

  public flatMap<U>(transform: (value: T) => Maybe<U>): Maybe<U> {
    return transform(this.__value)
  }

  public filter(predicate: (value: T) => boolean): Maybe<T> {
    return predicate(this.__value) ? this : new None<T>()
  }

  public getOrThrow(): T {
    return this.__value
  }

  public getOrThrowError(error: any): T {
    return this.__value
  }

  public getOrThrowComputedError(getError: () => any): T {
    return this.__value
  }

  public toString(): string {
    return `Maybe.Some(${this.__value})`
  }
}

class None<T> extends Maybe<T> {
  public isEmpty(): boolean {
    return true
  }

  public hasValue(): boolean {
    return false
  }

  public withValue(action: (value: T) => void): void {
    return
  }

  public or(maybe: Maybe<T>): Maybe<T> {
    return maybe
  }

  public orGet(getMaybe: () => Maybe<T>): Maybe<T> {
    return getMaybe()
  }

  public orElse(value: T): Maybe<T> {
    return new Some<T>(value)
  }

  public orElseGet(getValue: () => T): Maybe<T> {
    return new Some<T>(getValue())
  }

  public getOrElse(value: T): T {
    return value
  }

  public getOrElseComputed(getValue: () => T): T {
    return getValue()
  }

  public match<U>(outcomes: { some: (value: T) => U; none: () => U }): U {
    return outcomes.none()
  }

  public map<U>(transform: (value: T) => U): Maybe<U> {
    return new None<U>()
  }

  public flatMap<U>(transform: (value: T) => Maybe<U>): Maybe<U> {
    return new None<U>()
  }

  public filter(predicate: (value: T) => boolean): Maybe<T> {
    return this
  }

  public getOrThrow(): T {
    throw new TypeError('No value')
  }

  public getOrThrowError(error: any): T {
    throw error
  }

  public getOrThrowComputedError(getError: () => any): T {
    throw getError()
  }

  public toString(): string {
    return `Maybe.None()`
  }
}
