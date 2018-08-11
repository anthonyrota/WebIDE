import { IOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { concatMap } from 'src/models/Stream/StreamOperators/concatMap'

export function concatMapTo<T>(stream: Stream<T>): IOperator<unknown, T> {
  return concatMap(() => stream)
}
