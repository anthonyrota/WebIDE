import { IDisposable } from 'src/models/Disposable/IDisposable'
import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function audit<T>(
  getShouldClearThrottleStream: (value: T, index: number) => Stream<unknown>
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new AuditValueTransmitter(target, getShouldClearThrottleStream)
  )
}

class AuditValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private mutableValue: MutableMaybe<T> = MutableMaybe.none()
  private shouldClearThrottleStreamSubscription: IDisposable | null = null
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<T>,
    private getShouldClearThrottleStream: (
      value: T,
      index: number
    ) => Stream<unknown>
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.mutableValue.setAs(value)

    if (!this.shouldClearThrottleStreamSubscription) {
      const { getShouldClearThrottleStream } = this
      const index = this.index++
      let shouldClearThrottleStream: Stream<unknown>

      try {
        shouldClearThrottleStream = getShouldClearThrottleStream(value, index)
      } catch (error) {
        this.destination.error(error)
        return
      }

      this.shouldClearThrottleStreamSubscription = this.subscribeStreamToSelf(
        shouldClearThrottleStream
      )
    }
  }

  protected onOuterNextValue(): void {
    this.clearThrottle()
  }

  protected onOuterComplete(): void {
    this.clearThrottle()
  }

  private clearThrottle(): void {
    if (this.shouldClearThrottleStreamSubscription) {
      this.shouldClearThrottleStreamSubscription.dispose()
      this.shouldClearThrottleStreamSubscription = null
    }

    this.mutableValue.withValue(value => {
      this.mutableValue.empty()
      this.destination.next(value)
    })
  }
}
