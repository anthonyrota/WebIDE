import { curry2 } from './curry'

export const ifExists: {
  <T, U>(func: (value: T) => U): (value: T | undefined | null) => U | null
  <T, U>(func: (value: T) => U, value: T | undefined | null): U | null
} = curry2(
  <T, U>(func: (value: T) => U, value: T | undefined | null): U | null => {
    return value == null ? null : func(value)
  }
)
