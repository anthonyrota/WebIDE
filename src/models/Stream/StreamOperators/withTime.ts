import { getTime } from 'src/utils/getTime'
import { Operation } from '../Operation'
import { map } from './map'

export function withTime<T>(): Operation<T, ITimestamp<T>> {
  return map(value => ({ value, currentTime: getTime() }))
}

export interface ITimestamp<T> {
  value: T
  currentTime: number
}
