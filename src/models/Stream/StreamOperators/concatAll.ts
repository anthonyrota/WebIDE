import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { concatMap } from 'src/models/Stream/StreamOperators/concatMap'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { identity } from 'src/utils/identity'

export function concatAll<T>(): IOperator<Stream<T>, T> {
  return new ConcatAllOperator<T>()
}

class ConcatAllOperator<T> implements IOperator<Stream<T>, T> {
  public call(
    target: MonoTypeValueTransmitter<T>,
    source: Stream<Stream<T>>
  ): IDisposableLike {
    return source.lift(concatMap(identity)).subscribe(target)
  }
}
