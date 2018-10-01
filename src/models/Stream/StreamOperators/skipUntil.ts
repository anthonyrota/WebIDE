import { IDisposable } from 'src/models/Disposable/IDisposable'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function skipUntil<T>(notifier: Stream<unknown>): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new SkipUntilValueTransmitter(target, notifier)
  )
}

class SkipUntilValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private hasStoppedSkippingValues: boolean = false
  private notifierSubscription: IDisposable

  constructor(target: ISubscriptionTarget<T>, notifier: Stream<unknown>) {
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
  }
}
