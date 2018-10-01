import { bound } from 'src/decorators/bound'
import {
  IScheduler,
  ISchedulerActionWithoutData
} from 'src/models/Scheduler/Scheduler'
import { sync } from 'src/models/Scheduler/sync'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  createCompleteNotification,
  createNextNotification,
  distributeNotification,
  Notification
} from 'src/models/Stream/Notification'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function delay<T>(
  delayTime: number,
  scheduler: IScheduler = sync
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new DelayValueTransmitter(target, delayTime, scheduler)
  )
}

interface IDelayedMessage<T> {
  notification: Notification<T>
  dueTime: number
}

class DelayValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private notificationQueue: Array<IDelayedMessage<T>> = []
  private isScheduled: boolean = false

  constructor(
    target: ISubscriptionTarget<T>,
    private delayTime: number,
    private scheduler: IScheduler
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.scheduleNotification(createNextNotification(value))
  }

  protected onComplete(): void {
    this.scheduleNotification(createCompleteNotification())
  }

  private scheduleNotification(notification: Notification<T>): void {
    const delayMessage: IDelayedMessage<T> = {
      notification,
      dueTime: this.scheduler.now() + this.delayTime
    }

    this.notificationQueue.push(delayMessage)

    if (!this.isScheduled) {
      this.isScheduled = true
      this.addOnDispose(
        this.scheduler.scheduleDelayed(
          this.distributeNotifications,
          this.delayTime
        )
      )
    }
  }

  @bound
  private distributeNotifications(action: ISchedulerActionWithoutData): void {
    while (
      this.isActive() &&
      this.notificationQueue.length > 0 &&
      this.notificationQueue[0].dueTime - this.scheduler.now() <= 0
    ) {
      distributeNotification(
        this.notificationQueue.shift()!.notification,
        this.destination
      )
    }

    if (this.notificationQueue.length > 0) {
      action.scheduleDelayed(
        Math.max(0, this.notificationQueue[0].dueTime - this.scheduler.now())
      )
    } else {
      this.isScheduled = false
    }
  }
}
