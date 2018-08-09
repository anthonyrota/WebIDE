function indexOfPolyfill<T>(array: T[], item: T): number {
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

export function indexOf<T>(array: T[], item: T): number {
  if (Array.prototype.indexOf) {
    return Array.prototype.indexOf.call(array, item)
  } else {
    return indexOfPolyfill<T>(array, item)
  }
}
