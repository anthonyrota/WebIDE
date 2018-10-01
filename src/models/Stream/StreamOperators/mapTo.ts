import { Operation } from '../Operation'
import { map } from './map'

export function mapTo<T>(value: T): Operation<unknown, T> {
  return map(() => value)
}
