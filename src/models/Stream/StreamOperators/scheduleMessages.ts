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

export function scheduleMessages<T>(
  scheduler: IScheduler,
  delay: number = 0
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new ScheduleMessagesValueTransmitter(target, scheduler, delay)
  )
}

interface ISchedulerData<T> {
  transmitter: ScheduleMessagesValueTransmitter<T>
  notification: Notification<T>
}

class ScheduleMessagesValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  constructor(
    target: ISubscriptionTarget<T>,
    private scheduler: IScheduler,
    private delay: number
  ) {
    super(target)
  }

  private static schedulerCallback<T>(data: ISchedulerData<T>) {
    distributeNotification(data.notification, data.transmitter)
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
      this.scheduler.scheduleDelayedWithData<ISchedulerData<T>>(
        ScheduleMessagesValueTransmitter.schedulerCallback,
        this.delay,
        { transmitter: this, notification }
      )
    )
  }
}
