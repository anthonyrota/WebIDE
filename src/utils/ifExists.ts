import { curry2 } from './curry'

function ifExistsImplementation<T, U>(func: (value: T) => U, value: T): U
function ifExistsImplementation<T, U>(func: (value: T) => U, value: null): null
function ifExistsImplementation<T, U>(
  func: (value: T) => U,
  value: undefined
): undefined
function ifExistsImplementation<T, U>(
  func: (value: T) => U,
  value: T | undefined | null
): U | undefined | null {
  return value == null ? value : func(value)
}

export const ifExists = curry2(ifExistsImplementation) as {
  <T, U>(func: (value: T) => U): {
    (value: T): U
    (value: undefined): undefined
    (value: null): null
  }
  <T, U>(func: (value: T) => U, value: T): U
  <T, U>(func: (value: T) => U, value: null): null
  <T, U>(func: (value: T) => U, value: undefined): undefined
}
