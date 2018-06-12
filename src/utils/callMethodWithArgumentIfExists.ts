import { curry3 } from 'src/utils/curry'

export const callMethodWithArgumentIfExists: {
  <
    TMethodName extends string,
    TArgument,
    TReturnValue,
    TObject extends {
      [TKey in TMethodName]?: (argumentValue: TArgument) => TReturnValue
    }
  >(
    methodName: TMethodName
  ): {
    (argumentValue: TArgument): (object: TObject) => TReturnValue
    (argumentValue: TArgument, object: TObject): TReturnValue | null
  }
  <
    TMethodName extends string,
    TArgument,
    TReturnValue,
    TObject extends {
      [TKey in TMethodName]?: (argumentValue: TArgument) => TReturnValue
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
      [TKey in TMethodName]?: (argumentValue: TArgument) => TReturnValue
    }
  >(
    methodName: TMethodName,
    argumentValue: TArgument,
    object: TObject
  ): TReturnValue | null
} = curry3(
  <
    TArgument,
    TReturnValue,
    TMethodName extends string,
    TObject extends {
      [TKey in TMethodName]?: (argumentValue: TArgument) => TReturnValue
    }
  >(
    methodName: TMethodName,
    argumentValue: TArgument,
    object: TObject
  ): TReturnValue | null => {
    return object[methodName]
      ? (object[methodName] as (argumentValue: TArgument) => TReturnValue)(
          argumentValue
        )
      : null
  }
)
