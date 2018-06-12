import { curry2 } from 'src/utils/curry'

export const compose2: {
  <TInputArgument, TPassedValue, TOutputReturnValue>(
    first: (value: TPassedValue) => TOutputReturnValue
  ): (
    second: (value: TInputArgument) => TPassedValue
  ) => (value: TInputArgument) => TOutputReturnValue
  <TInputArgument, TPassedValue, TOutputReturnValue>(
    first: (value: TPassedValue) => TOutputReturnValue,
    second: (value: TInputArgument) => TPassedValue
  ): (value: TInputArgument) => TOutputReturnValue
} = curry2(
  <TInputArgument, TPassedValue, TOutputReturnValue>(
    first: (value: TPassedValue) => TOutputReturnValue,
    second: (value: TInputArgument) => TPassedValue
  ): ((value: TInputArgument) => TOutputReturnValue) => {
    return (value: TInputArgument): TOutputReturnValue => {
      return first(second(value))
    }
  }
)
