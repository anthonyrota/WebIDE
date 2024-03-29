import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  createCompleteNotification,
  createErrorNotification,
  createNextNotification,
  distributeNotification,
  Notification
} from 'src/models/Stream/Notification'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function scheduleMessagesDelayed<T>(
  scheduler: IScheduler,
  delay: number
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target =>
      new ScheduleMessagesDelayedValueTransmitter(target, scheduler, delay)
  )
}

class ScheduleMessagesDelayedValueTransmitter<
  T
> extends MonoTypeValueTransmitter<T> {
  constructor(
    target: ISubscriptionTarget<T>,
    private scheduler: IScheduler,
    private delay: number
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.scheduleNotification(createNextNotification(value))
  }

  protected onError(error: unknown): void {
    this.scheduleNotification(createErrorNotification(error))
  }

  protected onComplete(): void {
    this.scheduleNotification(createCompleteNotification())
  }

  private scheduleNotification(notification: Notification<T>): void {
    this.addOnDispose(
      this.scheduler.scheduleDelayedWithData<Notification<T>>(
        this.distributeNotification,
        this.delay,
        notification
      )
    )
  }

  private distributeNotification(notification: Notification<T>): void {
    distributeNotification(notification, this)
  }
}
