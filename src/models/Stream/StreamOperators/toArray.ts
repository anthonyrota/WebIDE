import { Operation } from '../Operation'
import { reduceWithInitialValue } from './reduceWithInitialValue'

export function toArray<T>(): Operation<T, T[]> {
  return reduceWithInitialValue((array: T[], item: T) => {
    array.push(item)
    return array
  }, [])
}
