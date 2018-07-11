import { bound } from 'src/decorators/bound'

export class MutableMaybe<T> {
  private __state: { hasValue: true; value: T } | { hasValue: false }
  private __immutableView: ImmutableMutableMaybeView<T>

  private constructor(hasValue: false)
  private constructor(hasValue: true, value: T)
  private constructor(hasValue: boolean, value?: T) {
    this.__state = hasValue
      ? { hasValue: true, value: value as T }
      : { hasValue: false }
  }

  public static fromNullable<T>(
    valueOrNull: T | null | undefined
  ): MutableMaybe<T> {
    return valueOrNull == null
      ? new MutableMaybe<T>(false)
      : new MutableMaybe<T>(true, valueOrNull)
  }

  public static fromNonNullable<T>(
    valueOrNull: T | null | undefined
  ): MutableMaybe<T> {
    if (valueOrNull == null) {
      throw new TypeError('value is null')
    }
    return new MutableMaybe<T>(true, valueOrNull)
  }

  public static none<T>(): MutableMaybe<T> {
    return new MutableMaybe<T>(false)
  }

  public static some<T>(value: T): MutableMaybe<T> {
    return new MutableMaybe<T>(true, value)
  }

  public isEmpty(): boolean {
    return !this.__state.hasValue
  }

  public hasValue(): boolean {
    return this.__state.hasValue
  }

  public withValue(action: (value: T) => void): this {
    if (this.__state.hasValue) {
      action(this.__state.value)
    }
    return this
  }

  public getOrElse(value: T): T {
    return this.__state.hasValue ? this.__state.value : value
  }

  public getOrElseComputed(getValue: () => T): T {
    return this.__state.hasValue ? this.__state.value : getValue()
  }

  public match<U>(outcomes: { some: (value: T) => U; none: () => U }): U {
    return this.__state.hasValue
      ? outcomes.some(this.__state.value)
      : outcomes.none()
  }

  public clone(): MutableMaybe<T> {
    return this.__state.hasValue
      ? new MutableMaybe<T>(true, this.__state.value)
      : new MutableMaybe<T>(false)
  }

  public copy(other: MutableMaybe<T>): this {
    other.match({
      none: this.__boundEmpty,
      some: this.__boundSetValue
    })
    return this
  }

  public copyIfEmpty(other: MutableMaybe<T>): this {
    if (this.__state.hasValue) {
      other.withValue(this.__boundSetValue)
    }
    return this
  }

  public copyComputedIfEmpty(getOther: () => MutableMaybe<T>): this {
    if (this.__state.hasValue) {
      getOther().withValue(this.__boundSetValue)
    }
    return this
  }

  public setValue(value: T): this {
    this.__state = {
      hasValue: true,
      value
    }
    return this
  }

  public empty(): this {
    this.__state = { hasValue: false }
    return this
  }

  public transform(transformValue: (value: T) => T): this {
    if (this.__state.hasValue) {
      this.setValue(transformValue(this.__state.value))
    }
    return this
  }

  public mutate(mutateValue: (value: T) => void): this {
    if (this.__state.hasValue) {
      mutateValue(this.__state.value)
    }
    return this
  }

  public flatTransform(transformValue: (value: T) => MutableMaybe<T>): this {
    if (this.__state.hasValue) {
      this.copy(transformValue(this.__state.value))
    }
    return this
  }

  public emptyIf(predicate: (value: T) => boolean): this {
    if (this.__state.hasValue && predicate(this.__state.value)) {
      this.empty()
    }
    return this
  }

  public getOrThrow(): T {
    if (!this.__state.hasValue) {
      throw new TypeError('No value')
    }
    return this.__state.value
  }

  public getOrThrowError(error: any): T {
    if (!this.__state.hasValue) {
      throw error
    }
    return this.__state.value
  }

  public getOrThrowComputedError(getError: () => any): T {
    if (!this.__state.hasValue) {
      throw getError()
    }
    return this.__state.value
  }

  public toString(): string {
    return this.__state.hasValue
      ? `MutableMaybe.Some(${this.__state.value})`
      : `MutableMaybe.None()`
  }

  public throwValue(): void {
    if (this.__state.hasValue) {
      throw this.__state.value
    }
  }

  public getImmutableView(): ImmutableMutableMaybeView<T> {
    if (!this.__immutableView) {
      this.__immutableView = new ImmutableMutableMaybeView<T>(this)
    }
    return this.__immutableView
  }

  @bound
  private __boundEmpty(): void {
    this.__state = { hasValue: false }
  }

  @bound
  private __boundSetValue(value: T): void {
    this.__state = { hasValue: true, value }
  }
}

export class ImmutableMutableMaybeView<T> {
  private __maybe: MutableMaybe<T>

  constructor(mutableView: MutableMaybe<T>) {
    this.__maybe = mutableView
  }

  public isEmpty(): boolean {
    return this.__maybe.isEmpty()
  }

  public hasValue(): boolean {
    return this.__maybe.hasValue()
  }

  public withValue(action: (value: T) => void): this {
    this.__maybe.withValue(action)
    return this
  }

  public getOrElse(value: T): T {
    return this.__maybe.getOrElse(value)
  }

  public getOrElseComputed(getValue: () => T): T {
    return this.__maybe.getOrElseComputed(getValue)
  }

  public match<U>(outcomes: { some: (value: T) => U; none: () => U }): U {
    return this.__maybe.match(outcomes)
  }

  public clone(): MutableMaybe<T> {
    return this.__maybe.clone()
  }

  public getOrThrow(): T {
    return this.__maybe.getOrThrow()
  }

  public getOrThrowError(error: any): T {
    return this.__maybe.getOrThrowError(error)
  }

  public getOrThrowComputedError(getError: () => any): T {
    return this.__maybe.getOrThrowComputedError(getError)
  }

  public toString(): string {
    return `ImmutableMutableMaybeView(${this.__maybe})`
  }

  public throwValue(): void {
    return this.__maybe.throwValue()
  }

  public getImmutableView(): ImmutableMutableMaybeView<T> {
    return this
  }
}
