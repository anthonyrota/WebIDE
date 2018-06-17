import { curry2 } from 'src/utils/curry'
import { indexOf } from 'src/utils/indexOf'
import { splice } from 'src/utils/splice'

export const remove: {
  <T>(item: T): (array: T[]) => void
  <T>(item: T, array: T[]): void
} = curry2(
  <T>(item: T, array: T[]): void => {
    const index = indexOf(item, array)
    if (index !== -1) {
      splice(1, index, array)
    }
  }
)
