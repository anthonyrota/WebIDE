export class ImmutableStack<T> {
  private __depth: number
  private __value: T
  private __parent: ImmutableStack<T> | null

  private constructor(
    depth: number,
    value: T,
    parent: ImmutableStack<T> | null
  ) {
    this.__depth = depth
    this.__value = value
    this.__parent = parent
  }

  public static ofValue<T>(value: T): ImmutableStack<T> {
    return new ImmutableStack<T>(1, value, null)
  }

  public getSize(): number {
    return this.__depth
  }

  public getLastValue(): T {
    return this.__value
  }

  public push(value: T): ImmutableStack<T> {
    return new ImmutableStack(this.__depth + 1, value, this)
  }

  public pop(): ImmutableStack<T> {
    return this.__parent === null ? this : this.__parent
  }

  public toString(): string {
    return this.__parent === null
      ? `ImmutableStack.Head(${this.__value})`
      : `ImmutableStack.Tail(${this.__parent}, ${this.__value})`
  }
}
