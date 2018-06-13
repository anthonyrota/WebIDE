import { curry2 } from 'src/utils/curry'

export const eq: {
  <T>(a: T): (b: T) => boolean
  <T>(a: T, b: T): boolean
} = curry2(
  <T>(a: T, b: T): boolean => {
    return a === b
  }
)
