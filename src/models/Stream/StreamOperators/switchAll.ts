import { identity } from 'src/utils/identity'
import { Operation } from '../Operation'
import { Stream } from '../Stream'
import { switchMap } from './switchMap'

export function switchAll<T>(): Operation<Stream<T>, T> {
  return switchMap(identity)
}
