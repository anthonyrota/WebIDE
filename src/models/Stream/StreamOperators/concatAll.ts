import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { concatMap } from 'src/models/Stream/StreamOperators/concatMap'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { identity } from 'src/utils/identity'

export function concatAll<T>(): IConnectOperator<Stream<T>, T> {
  return new ConcatAllOperator<T>()
}

class ConcatAllOperator<T> implements IConnectOperator<Stream<T>, T> {
  public connect(
    target: MonoTypeValueTransmitter<T>,
    source: Stream<Stream<T>>
  ): IDisposableLike {
    return source.lift(concatMap(identity)).subscribe(target)
  }
}
