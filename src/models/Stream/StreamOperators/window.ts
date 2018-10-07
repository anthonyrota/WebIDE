import { ControlledStream, IControlledStream } from '../ControlledStream'
import { DoubleInputValueTransmitter } from '../DoubleInputValueTransmitter'
import { ISubscriptionTarget } from '../ISubscriptionTarget'
import { operate, Operation } from '../Operation'
import { Stream } from '../Stream'

export function window<T>(
  boundaries: Stream<unknown>
): Operation<T, Stream<T>> {
  return operate((source, target) => {
    const transmitter = new WindowValueTransmitter(target)
    const subscription = source.subscribe(transmitter)

    if (subscription.isActive()) {
      transmitter.subscribeStreamToSelf(boundaries)
    }

    return subscription
  })
}

class WindowValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  Stream<T>,
  unknown
> {
  private currentWindow: IControlledStream<T, T> = new ControlledStream<T>()

  constructor(target: ISubscriptionTarget<Stream<T>>) {
    super(target)
    this.destination.next(this.currentWindow)
  }

  protected onNextValue(value: T): void {
    this.currentWindow.next(value)
  }

  protected onError(error: unknown): void {
    this.currentWindow.error(error)
    this.destination.error(error)
  }

  protected onComplete(): void {
    this.currentWindow.complete()
    this.destination.complete()
  }

  protected onOuterNextValue(): void {
    this.currentWindow.complete()
    this.currentWindow = new ControlledStream<T>()
    this.destination.next(this.currentWindow)
  }
}
