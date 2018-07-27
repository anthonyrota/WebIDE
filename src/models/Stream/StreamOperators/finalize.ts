import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function finalize<T>(onFinish: () => void): IOperator<T, T> {
  return new FinalizeOperator<T>(onFinish)
}

class FinalizeOperator<T> implements IOperator<T, T> {
  constructor(private onFinish: () => any) {}

  public call(
    target: MonoTypeValueTransmitter<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new FinalizeSubscriber<T>(target, this.onFinish))
  }
}

class FinalizeSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, onFinish: () => any) {
    super(target)
    super.onDispose(onFinish)
  }
}
