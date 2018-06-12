import { curry2 } from 'src/utils/curry'

export const callMethod: {
  <
    TMethodName extends string,
    TReturnValue,
    TObject extends { [TKey in TMethodName]: () => TReturnValue }
  >(
    methodName: TMethodName
  ): (object: TObject) => TReturnValue
  <
    TMethodName extends string,
    TReturnValue,
    TObject extends { [TKey in TMethodName]: () => TReturnValue }
  >(
    methodName: TMethodName,
    object: TObject
  ): TReturnValue
} = curry2(
  <
    TMethodName extends string,
    TArgument,
    TReturnValue,
    TObject extends { [TKey in TMethodName]: () => TReturnValue }
  >(
    methodName: TMethodName,
    object: TObject
  ): TReturnValue => {
    return object[methodName]()
  }
)
