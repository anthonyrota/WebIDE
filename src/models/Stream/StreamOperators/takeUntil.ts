import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function takeUntil<T>(notifier: Stream<any>): IOperator<T, T> {
  return new TakeUntilOperator<T>(notifier)
}

class TakeUntilOperator<T> implements IOperator<T, T> {
  constructor(private notifier: Stream<any>) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
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
