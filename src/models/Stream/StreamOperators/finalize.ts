import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function finalize<T>(onFinish: () => void): IConnectOperator<T, T> {
  return new FinalizeOperator<T>(onFinish)
}

class FinalizeOperator<T> implements IConnectOperator<T, T> {
  constructor(private onFinish: () => any) {}

  public connect(
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
