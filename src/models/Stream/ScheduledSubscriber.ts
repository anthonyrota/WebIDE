import { Subscription } from 'src/models/Disposable/Subscription'
import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { IRequiredSubscriber, ISubscriber } from 'src/models/Stream/ISubscriber'

export class ScheduledSubscriber<T> extends Subscription
  implements IRequiredSubscriber<T> {
  private __target: ISubscriber<T>
  private __scheduler: IScheduler

  constructor(target: ISubscriber<T>, scheduler: IScheduler) {
    super()
    this.__target = target
    this.__scheduler = scheduler
  }

  public next(value: T): void {
    if (this.__target.next) {
      this.terminateDisposableWhenDisposed(
        this.__scheduler.schedule(this.__target.next.bind(this.__target, value))
      )
    }
  }

  public error(error: any): void {
    if (this.__target.error) {
      this.terminateDisposableWhenDisposed(
        this.__scheduler.schedule(
          this.__target.error.bind(this.__target, error)
        )
      )
    }
  }

  public complete(): void {
    if (this.__target.complete) {
      this.terminateDisposableWhenDisposed(
        this.__scheduler.schedule(this.__target.complete.bind(this.__target))
      )
    }
  }
}
