import { bound } from 'src/decorators/bound'
import {
  IScheduler,
  ISchedulerActionWithoutData
} from 'src/models/Scheduler/Scheduler'
import { sync } from 'src/models/Scheduler/sync'
import { ISubscriptionTarget } from '../ISubscriptionTarget'
import { operateThroughValueTransmitter, Operation } from '../Operation'
import { Stream } from '../Stream'
import { ValueTransmitter } from '../ValueTransmitter'

export function timeout<T>(
  maxTimeBetweenValues: number,
  fallbackStream: Stream<T>,
  scheduler: IScheduler = sync
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target =>
      new TimeoutValueTransmitter(
        target,
        maxTimeBetweenValues,
        fallbackStream,
        scheduler
      )
  )
}

class TimeoutValueTransmitter<T> extends ValueTransmitter<T, T> {
  private scheduledAction: ISchedulerActionWithoutData | null = null

  constructor(
    target: ISubscriptionTarget<T>,
    private maxTimeBetweenValues: number,
    private fallbackStream: Stream<T>,
    private scheduler: IScheduler
  ) {
    super(target)
    this.scheduleTimeout()
  }

  protected onNextValue(value: T): void {
    this.scheduleTimeout()
    this.destination.next(value)
  }

  private scheduleTimeout(): void {
    if (this.scheduledAction) {
      this.scheduledAction.scheduleDelayed(this.maxTimeBetweenValues)
    } else {
      this.scheduledAction = this.scheduler.scheduleDelayed(
        this.switchToFallbackStream,
        this.maxTimeBetweenValues
      )
      this.addOnDispose(this.scheduledAction)
    }
  }

  @bound
  private switchToFallbackStream(): void {
    this.disposeAndRecycle()
    this.fallbackStream.subscribe(this.destination)
  }
}
