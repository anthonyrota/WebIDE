import { curry2 } from './curry'

export const callWithArgument: {
  <TArgument, TReturnValue>(argument: TArgument): (
    func: (argument: TArgument) => TReturnValue
  ) => TReturnValue
  <TArgument, TReturnValue>(
    argument: TArgument,
    func: (argument: TArgument) => TReturnValue
  ): TReturnValue
} = curry2(
  <TArgument, TReturnValue>(
    argument: TArgument,
    func: (argument: TArgument) => TReturnValue
  ): TReturnValue => {
    return func(argument)
  }
)
