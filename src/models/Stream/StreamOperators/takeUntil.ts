import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { operate, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function takeUntil<T>(notifier: Stream<unknown>): Operation<T, T> {
  return operate((source, target) => {
    const transmitter = new TakeUntilValueTransmitter(target)
    const notifierSubscription = transmitter.subscribeStreamToSelf(notifier)

    if (notifierSubscription.isActive()) {
      return source.subscribe(target)
    }
  })
}

class TakeUntilValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  public onOuterNextValue(): void {
    this.complete()
  }
}
