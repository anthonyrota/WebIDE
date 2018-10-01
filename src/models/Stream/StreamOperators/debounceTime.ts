import { bound } from 'src/decorators/bound'
import { ISubscription } from 'src/models/Disposable/Subscription'
import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { sync } from 'src/models/Scheduler/sync'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function debounceTime<T>(
  duration: number,
  scheduler: IScheduler = sync
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new DebounceTimeValueTransmitter(target, duration, scheduler)
  )
}

class DebounceTimeValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private mutableValue: MutableMaybe<T> = MutableMaybe.none()
  private delaySubscription: ISubscription | null = null

  constructor(
    target: ISubscriptionTarget<T>,
    private duration: number,
    private scheduler: IScheduler
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.clearDebounce()
    this.mutableValue.setAs(value)
    this.delaySubscription = this.scheduler.scheduleDelayed(
      this.distributeValue,
      this.duration
    )
    this.addOnDispose(this.delaySubscription)
  }

  protected onComplete(): void {
    this.distributeValue()
    this.destination.complete()
  }

  private clearDebounce(): void {
    if (this.delaySubscription) {
      this.delaySubscription.dispose()
      this.delaySubscription = null
    }
  }

  @bound
  private distributeValue(): void {
    this.clearDebounce()
    this.mutableValue.withValue(value => {
      this.mutableValue.empty()
      this.destination.next(value)
    })
  }
}
