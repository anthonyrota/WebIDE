import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { mergeMap } from 'src/models/Stream/StreamOperators/mergeMap'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { identity } from 'src/utils/identity'

export function mergeAll<T>(): IOperator<Stream<T>, T> {
  return new MergeAllOperator<T>()
}

class MergeAllOperator<T> implements IOperator<Stream<T>, T> {
  public call(
    target: MonoTypeValueTransmitter<T>,
    source: Stream<Stream<T>>
  ): IDisposableLike {
    return source.lift(mergeMap(identity)).subscribe(target)
  }
}
