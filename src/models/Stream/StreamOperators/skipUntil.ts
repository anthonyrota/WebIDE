import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function skipUntil<T>(notifier: Stream<unknown>): IOperator<T, T> {
  return new SkipUntilOperator<T>(notifier)
}

class SkipUntilOperator<T> implements IOperator<T, T> {
  constructor(private notifier: Stream<unknown>) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new SkipUntilSubscriber<T>(target, this.notifier))
  }
}

class SkipUntilSubscriber<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private hasStoppedSkippingValues: boolean = false
  private notifierSubscription: IDisposable

  constructor(target: ISubscriber<T>, notifier: Stream<unknown>) {
    super(target)
    this.notifierSubscription = this.subscribeStreamToSelf(notifier)
  }

  protected onNextValue(value: T): void {
    if (this.hasStoppedSkippingValues) {
      this.destination.next(value)
    }
  }

  protected onOuterNextValue(): void {
    this.hasStoppedSkippingValues = false
    this.notifierSubscription.dispose()
  }

  protected onOuterComplete(): void {
    this.hasStoppedSkippingValues = false
    this.notifierSubscription.dispose()
  }
}
