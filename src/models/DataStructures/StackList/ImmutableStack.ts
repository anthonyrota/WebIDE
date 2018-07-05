export class ImmutableStackList<T> {
  private __depth: number
  private __value: T
  private __parent: ImmutableStackList<T> | null

  private constructor(
    depth: number,
    value: T,
    parent: ImmutableStackList<T> | null
  ) {
    this.__depth = depth
    this.__value = value
    this.__parent = parent
  }

  public static ofValue<T>(value: T): ImmutableStackList<T> {
    return new ImmutableStackList<T>(1, value, null)
  }

  public getSize(): number {
    return this.__depth
  }

  public getLastValue(): T {
    return this.__value
  }

  public push(value: T): ImmutableStackList<T> {
    return new ImmutableStackList(this.__depth + 1, value, this)
  }

  public pop(): ImmutableStackList<T> {
    return this.__parent === null ? this : this.__parent
  }

  public toString(): string {
    return this.__parent === null
      ? `ImmutableStackList.Head(${this.__value})`
      : `ImmutableStackList.Tail(${this.__parent}, ${this.__value})`
  }
}
