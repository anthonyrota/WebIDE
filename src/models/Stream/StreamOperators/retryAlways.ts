import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function retryAlways<T>(): IConnectOperator<T, T> {
  return new RetryOperator<T>()
}

class RetryOperator<T> implements IConnectOperator<T, T> {
  public connect(
    target: MonoTypeValueTransmitter<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new RetrySubscriber<T>(target, source))
  }
}

class RetrySubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, private source: Stream<T>) {
    super(target)
  }

  public error(): void {
    if (this.isActive()) {
      this.unsubscribeAndRecycle()
      this.source.subscribe(this)
    }
  }
}
