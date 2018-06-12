import { curry2 } from 'src/utils/curry'

export const callMethodIfExists: {
  <
    TMethodName extends string,
    TReturnValue,
    TObject extends { [TKey in TMethodName]?: () => TReturnValue }
  >(
    methodName: TMethodName
  ): (object: TObject) => TReturnValue | null
  <
    TMethodName extends string,
    TReturnValue,
    TObject extends { [TKey in TMethodName]?: () => TReturnValue }
  >(
    methodName: TMethodName,
    object: TObject
  ): TReturnValue | null
} = curry2(
  <
    TMethodName extends string,
    TArgument,
    TReturnValue,
    TObject extends { [TKey in TMethodName]?: () => TReturnValue }
  >(
    methodName: TMethodName,
    object: TObject
  ): TReturnValue | null => {
    return object[methodName]
      ? (object[methodName] as () => TReturnValue)()
      : null
  }
)
