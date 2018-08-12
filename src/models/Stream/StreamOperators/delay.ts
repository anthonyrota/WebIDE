import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import {
  IScheduler,
  ISchedulerActionWithData
} from 'src/models/Scheduler/Scheduler'
import { sync } from 'src/models/Scheduler/sync'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import {
  distributeNotification,
  Notification,
  NotificationType
} from 'src/models/Stream/Notification'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function delay<T>(
  delayTime: number,
  scheduler: IScheduler = sync
): IOperator<T, T> {
  return new DelayOperator<T>(delayTime, scheduler)
}

class DelayOperator<T> implements IOperator<T, T> {
  constructor(private delayTime: number, private scheduler: IScheduler) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new DelaySubscriber(target, this.delayTime, this.scheduler)
    )
  }
}

interface IDelayMessage<T> {
  notification: Notification<T>
  dueTime: number
}

class DelaySubscriber<T> extends MonoTypeValueTransmitter<T> {
  private notificationQueue: Array<IDelayMessage<T>> = []
  private isScheduled: boolean = false

  constructor(
    target: ISubscriber<T>,
    private delayTime: number,
    private scheduler: IScheduler
  ) {
    super(target)
  }

  private static schedulerCallback<T>(
    subscriber: DelaySubscriber<T>,
    action: ISchedulerActionWithData<DelaySubscriber<T>>
  ): void {
    while (
      subscriber.isActive() &&
      subscriber.notificationQueue.length > 0 &&
      subscriber.notificationQueue[0].dueTime - subscriber.scheduler.now() <= 0
    ) {
      distributeNotification(
        subscriber.notificationQueue.shift()!.notification,
        subscriber.destination
      )
    }

    if (subscriber.notificationQueue.length > 0) {
      action.scheduleDelayed(
        subscriber,
        Math.max(
          0,
          subscriber.notificationQueue[0].dueTime - subscriber.scheduler.now()
        )
      )
    } else {
      subscriber.isScheduled = false
    }
  }

  protected onNextValue(value: T): void {
    this.scheduleNotification({
      type: NotificationType.Next,
      value
    })
  }

  protected onComplete(): void {
    this.scheduleNotification({
      type: NotificationType.Complete
    })
  }

  private scheduleNotification(notification: Notification<T>): void {
    const delayMessage: IDelayMessage<T> = {
      notification,
      dueTime: this.scheduler.now() + this.delayTime
    }

    this.notificationQueue.push(delayMessage)

    if (!this.isScheduled) {
      this.isScheduled = true
      this.terminateDisposableWhenDisposed(
        this.scheduler.scheduleDelayedWithData<DelaySubscriber<T>>(
          DelaySubscriber.schedulerCallback,
          this,
          this.delayTime
        )
      )
    }
  }
}
