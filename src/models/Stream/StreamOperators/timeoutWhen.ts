import { ISubscription } from 'src/models/Disposable/Subscription'
import { DoubleInputValueTransmitter } from '../DoubleInputValueTransmitter'
import { ISubscriptionTarget } from '../ISubscriptionTarget'
import { operateThroughValueTransmitter, Operation } from '../Operation'
import { Stream } from '../Stream'

export function timeoutWhen<T>(
  getShouldTimeoutStream: () => Stream<unknown>,
  fallbackStream: Stream<T>
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target =>
      new TimeoutWhenValueTransmitter(
        target,
        getShouldTimeoutStream,
        fallbackStream
      )
  )
}

class TimeoutWhenValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private shouldTimeoutStreamSubscription: ISubscription | null = null

  constructor(
    target: ISubscriptionTarget<T>,
    private getShouldTimeoutStream: () => Stream<unknown>,
    private fallbackStream: Stream<T>
  ) {
    super(target)
    this.activateTimeout()
  }

  protected onNextValue(value: T): void {
    this.destination.next(value)
    this.activateTimeout()
  }

  protected onOuterNextValue(value: T): void {
    this.switchToReplacementStream()
  }

  protected onOuterComplete(): void {
    this.switchToReplacementStream()
  }

  private activateTimeout(): void {
    const { getShouldTimeoutStream } = this
    let shouldTimeoutStream: Stream<unknown>

    try {
      shouldTimeoutStream = getShouldTimeoutStream()
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (this.shouldTimeoutStreamSubscription) {
      this.shouldTimeoutStreamSubscription.dispose()
      this.shouldTimeoutStreamSubscription = null
    }

    this.shouldTimeoutStreamSubscription = this.subscribeStreamToSelf(
      shouldTimeoutStream
    )
  }

  private switchToReplacementStream(): void {
    this.disposeAndRecycle()
    this.fallbackStream.subscribe(this.destination)
  }
}
