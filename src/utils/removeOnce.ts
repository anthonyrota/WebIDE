import { indexOf } from 'src/utils/indexOf'

export function removeOnce<T>(array: T[], item: T): void {
  const index = indexOf(array, item)
  if (index !== -1) {
    array.splice(index, 1)
  }
}
