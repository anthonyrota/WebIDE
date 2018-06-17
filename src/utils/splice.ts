import { curry3 } from 'src/utils/curry'

export const splice: {
  <T>(amount: number): (index: number) => (array: T[]) => void
  <T>(amount: number, index: number): (array: T[]) => void
  <T>(amount: number, index: number, array: T[]): void
} = curry3(
  <T>(amount: number, index: number, array: T[]): void => {
    Array.prototype.splice.call(array, index, amount)
  }
)
