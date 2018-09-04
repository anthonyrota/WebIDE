import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import {
  distributeNotification,
  Notification,
  NotificationType
} from 'src/models/Stream/Notification'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function scheduleMessages<T>(
  scheduler: IScheduler,
  delay: number = 0
): IOperator<T, T> {
  return new ScheduleMessagesOperator<T>(scheduler, delay)
}

class ScheduleMessagesOperator<T> implements IOperator<T, T> {
  constructor(private scheduler: IScheduler, private delay: number) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new ScheduleMessagesSubscriber<T>(target, this.scheduler, this.delay)
    )
  }
}

interface ISchedulerData<T> {
  transmitter: ScheduleMessagesSubscriber<T>
  notification: Notification<T>
}

class ScheduleMessagesSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(
    target: ISubscriber<T>,
    private scheduler: IScheduler,
    private delay: number
  ) {
    super(target)
  }

  private static schedulerCallback<T>(data: ISchedulerData<T>) {
    distributeNotification(data.notification, data.transmitter)
  }

  protected onNextValue(value: T): void {
    this.scheduleNotification({
      type: NotificationType.Next,
      value
    })
  }

  protected onError(error: unknown): void {
    this.scheduleNotification({
      type: NotificationType.Error,
      error
    })
  }

  protected onComplete(): void {
    this.scheduleNotification({
      type: NotificationType.Complete
    })
  }

  private scheduleNotification(notification: Notification<T>): void {
    this.terminateDisposableWhenDisposed(
      this.scheduler.scheduleDelayedWithData<ISchedulerData<T>>(
        ScheduleMessagesSubscriber.schedulerCallback,
        this.delay,
        { transmitter: this, notification }
      )
    )
  }
}
