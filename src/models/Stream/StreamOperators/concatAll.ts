import { IConnectOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { concatMap } from 'src/models/Stream/StreamOperators/concatMap'
import { identity } from 'src/utils/identity'

export function concatAll<T>(): IConnectOperator<Stream<T>, T> {
  return concatMap(identity)
}
