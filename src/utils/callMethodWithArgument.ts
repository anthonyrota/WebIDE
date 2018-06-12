import { curry3 } from 'src/utils/curry'

export const callMethodWithArgument: {
  <
    TMethodName extends string,
    TArgument,
    TReturnValue,
    TObject extends {
      [TKey in TMethodName]: (argumentValue: TArgument) => TReturnValue
    }
  >(
    methodName: TMethodName
  ): {
    (argumentValue: TArgument): (object: TObject) => TReturnValue
    (argumentValue: TArgument, object: TObject): TReturnValue
  }
  <
    TMethodName extends string,
    TArgument,
    TReturnValue,
    TObject extends {
      [TKey in TMethodName]: (argumentValue: TArgument) => TReturnValue
    }
  >(
    methodName: TMethodName,
    argumentValue: TArgument
  ): (object: TObject) => TReturnValue
  <
    TMethodName extends string,
    TArgument,
    TReturnValue,
    TObject extends {
      [TKey in TMethodName]: (argumentValue: TArgument) => TReturnValue
    }
  >(
    methodName: TMethodName,
    argumentValue: TArgument,
    object: TObject
  ): TReturnValue
} = curry3(
  <
    TArgument,
    TReturnValue,
    TMethodName extends string,
    TObject extends {
      [TKey in TMethodName]: (argumentValue: TArgument) => TReturnValue
    }
  >(
    methodName: TMethodName,
    argumentValue: TArgument,
    object: TObject
  ): TReturnValue => {
    return object[methodName](argumentValue)
  }
)
