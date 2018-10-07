import { bound } from 'src/decorators/bound'
import { ISubscription } from 'src/models/Disposable/Subscription'
import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { sync } from 'src/models/Scheduler/sync'
import { operateThroughValueTransmitter, Operation } from '../Operation'
import { ValueTransmitter } from '../ValueTransmitter'
import { defaultThrottleOptions, IThrottleOptions } from './throttle'

export function throttleTime<T>(
  throttleDuration: number,
  scheduler: IScheduler = sync,
  options: IThrottleOptions = defaultThrottleOptions
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target =>
      new ThrottleTimeValueTransmitter(
        target,
        throttleDuration,
        scheduler,
        options
      )
  )
}

class ThrottleTimeValueTransmitter<T> extends ValueTransmitter<T, T> {
  private isScheduled: boolean = false
  private trailingValue: MutableMaybe<T> = MutableMaybe.none()

  constructor(
    target: ISubscription,
    private throttleDuration: number,
    private scheduler: IScheduler,
    private options: IThrottleOptions
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.isScheduled) {
      this.trailingValue.setAs(value)
      return
    }

    this.isScheduled = true
    this.addOnDispose(
      this.scheduler.scheduleDelayed(this.cancelThrottle, this.throttleDuration)
    )

    if (this.options.leading) {
      this.destination.next(value)
    }
  }

  protected onComplete(): void {
    if (this.options.trailing) {
      this.trailingValue.withValue(value => {
        this.destination.next(value)
      })
    }
    this.destination.complete()
  }

  @bound
  private cancelThrottle(): void {
    if (this.isScheduled) {
      this.isScheduled = false

      if (this.options.trailing) {
        this.trailingValue.withValue(value => {
          this.trailingValue.empty()
          this.destination.next(value)
        })
      }
    }
  }
}
