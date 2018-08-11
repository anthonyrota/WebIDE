import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function finalize<T>(onFinish: () => void): IOperator<T, T> {
  return new FinalizeOperator<T>(onFinish)
}

class FinalizeOperator<T> implements IOperator<T, T> {
  constructor(private onFinish: () => unknown) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new FinalizeSubscriber<T>(target, this.onFinish))
  }
}

class FinalizeSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, onFinish: () => unknown) {
    super(target)
    super.onDispose(onFinish)
  }
}
