import { ISubscription } from 'src/models/Disposable/Subscription'
import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import { DoubleInputValueTransmitter } from '../DoubleInputValueTransmitter'
import { ISubscriptionTarget } from '../ISubscriptionTarget'
import { operateThroughValueTransmitter, Operation } from '../Operation'
import { Stream } from '../Stream'

export interface IThrottleOptions {
  leading: boolean
  trailing: boolean
}

export const defaultThrottleOptions: IThrottleOptions = {
  leading: true,
  trailing: false
}

export function throttle<T>(
  getDurationStream: (value: T) => Stream<unknown>,
  options: IThrottleOptions = defaultThrottleOptions
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new ThrottleValueTransmitter(target, getDurationStream, options)
  )
}

class ThrottleValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private durationStreamSubscription: ISubscription | null = null
  private mutableValue: MutableMaybe<T> = MutableMaybe.none()

  constructor(
    target: ISubscriptionTarget<T>,
    private getDurationStream: (value: T) => Stream<unknown>,
    private options: IThrottleOptions
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.mutableValue.setAs(value)

    if (this.durationStreamSubscription) {
      return
    }

    if (this.options.leading) {
      this.distributeValue()
    } else {
      this.activateThrottleWithValue(value)
    }
  }

  protected onOuterNextValue(): void {
    this.cancelDurationStream()
  }

  protected onOuterComplete(): void {
    this.cancelDurationStream()
  }

  private distributeValue(): void {
    this.mutableValue.withValue(value => {
      this.mutableValue.empty()
      this.destination.next(value)
      this.activateThrottleWithValue(value)
    })
  }

  private activateThrottleWithValue(value: T): void {
    const { getDurationStream } = this
    let durationStream: Stream<unknown>

    try {
      durationStream = getDurationStream(value)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.durationStreamSubscription = this.subscribeStreamToSelf(durationStream)
  }

  private cancelDurationStream(): void {
    if (this.durationStreamSubscription) {
      this.durationStreamSubscription.dispose()
      this.durationStreamSubscription = null
    }

    if (this.options.trailing) {
      this.distributeValue()
    }
  }
}
