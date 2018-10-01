import { IDisposable } from 'src/models/Disposable/IDisposable'
import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function debounce<T>(
  getDurationStream: (value: T) => Stream<unknown>
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new DebounceValueTransmitter(target, getDurationStream)
  )
}

class DebounceValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private mutableValue: MutableMaybe<T> = MutableMaybe.none()
  private durationStreamSubscription: IDisposable | null = null

  constructor(
    target: ISubscriptionTarget<T>,
    private getDurationStream: (value: T) => Stream<unknown>
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { getDurationStream } = this
    let durationStream: Stream<unknown>

    try {
      durationStream = getDurationStream(value)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.mutableValue.setAs(value)

    if (this.durationStreamSubscription) {
      this.durationStreamSubscription.dispose()
      this.durationStreamSubscription = null
    }

    this.subscribeStreamToSelf(durationStream)
  }

  protected onComplete(): void {
    this.distributeValue()
    this.destination.complete()
  }

  protected onOuterNextValue(): void {
    this.distributeValue()
  }

  protected onOuterComplete(): void {
    this.distributeValue()
  }

  private distributeValue(): void {
    this.mutableValue.withValue(value => {
      if (this.durationStreamSubscription) {
        this.durationStreamSubscription.dispose()
        this.durationStreamSubscription = null
      }

      this.mutableValue.empty()
      this.destination.next(value)
    })
  }
}
