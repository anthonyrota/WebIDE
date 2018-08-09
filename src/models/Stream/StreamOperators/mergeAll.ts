import { IOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { mergeMap } from 'src/models/Stream/StreamOperators/mergeMap'
import { identity } from 'src/utils/identity'

export function mergeAll<T>(): IOperator<Stream<T>, T> {
  return mergeMap(identity)
}
