import { curry2 } from 'src/utils/curry'

function indexOfPolyfill<T>(item: T, array: T[]): number {
  const length = array.length
  let index = 0

  if (item === undefined) {
    for (; index < length; index++) {
      if (index in array && array[index] === undefined) {
        return index
      }
    }
  } else {
    for (; index < length; index++) {
      if (array[index] === item) {
        return index
      }
    }
  }

  return -1
}

export const indexOf: {
  <T>(item: T): (array: T[]) => number
  <T>(item: T, array: T[]): number
} = curry2(
  <T>(item: T, array: T[]): number => {
    if (Array.prototype.indexOf) {
      return Array.prototype.indexOf.call(array, item)
    } else {
      return indexOfPolyfill<T>(item, array)
    }
  }
)
