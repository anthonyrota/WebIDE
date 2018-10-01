import { Operation } from '../Operation'
import { Stream } from '../Stream'
import { switchMap } from './switchMap'

export function switchMapTo<T>(stream: Stream<T>): Operation<T, T> {
  return switchMap(() => stream)
}
