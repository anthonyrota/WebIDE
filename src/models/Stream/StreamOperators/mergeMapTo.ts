import { IOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { mergeMap } from 'src/models/Stream/StreamOperators/mergeMap'

export function mergeMapTo<T>(stream: Stream<T>): IOperator<unknown, T> {
  return mergeMap(() => stream)
}
