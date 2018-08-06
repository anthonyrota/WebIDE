import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function takeUntil<T>(notifier: Stream<any>): IConnectOperator<T, T> {
  return new TakeUntilOperator<T>(notifier)
}

class TakeUntilOperator<T> implements IConnectOperator<T, T> {
  constructor(private notifier: Stream<any>) {}

  public connect(
    target: MonoTypeValueTransmitter<T>,
    source: Stream<T>
  ): IDisposableLike {
    const subscriber = new TakeUntilSubscriber<T>(target)
    const notifierSubscription = subscriber.subscribeStreamToSelf(this.notifier)

    if (notifierSubscription.isActive()) {
      return source.subscribe(subscriber)
    }
  }
}

class TakeUntilSubscriber<T> extends DoubleInputValueTransmitter<T, T, any> {
  public onOuterNextValue(): void {
    this.complete()
  }
}
