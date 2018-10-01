import { bound } from 'src/decorators/bound'
import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import {
  IScheduler,
  ISchedulerActionWithoutData
} from 'src/models/Scheduler/Scheduler'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { operate, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function sampleTime<T>(
  emitValuePeriod: number,
  scheduler: IScheduler
): Operation<T, T> {
  return operate(
    (source, target) =>
      new SampleTimeValueTransmitter(target, emitValuePeriod, scheduler, source)
  )
}

class SampleTimeValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private mutableLatestValue: MutableMaybe<T> = MutableMaybe.none()

  constructor(
    target: ISubscriptionTarget<T>,
    private emitValuePeriod: number,
    scheduler: IScheduler,
    source: Stream<T>
  ) {
    super(target)

    source.subscribe(this)
    this.addOnDispose(
      scheduler.scheduleDelayed(this.schedulerCallback, emitValuePeriod)
    )
  }

  protected onNextValue(value: T): void {
    this.mutableLatestValue.setAs(value)
  }

  private emitValue(): void {
    this.mutableLatestValue.withValue(latestValue => {
      this.destination.next(latestValue)
    })
  }

  @bound
  private schedulerCallback(action: ISchedulerActionWithoutData): void {
    this.emitValue()
    action.scheduleDelayed(this.emitValuePeriod)
  }
}
