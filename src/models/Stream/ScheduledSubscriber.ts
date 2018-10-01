import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { IRequiredSubscriptionTarget, ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export class ScheduledSubscriber<T> extends MonoTypeValueTransmitter<T>
  implements IRequiredSubscriptionTarget<T> {
  private __scheduler: IScheduler

  constructor(target: ISubscriptionTarget<T>, scheduler: IScheduler) {
    super(target)
    this.__scheduler = scheduler
  }

  public next(value: T): void {
    this.addOnDispose(
      this.__scheduler.schedule(() => {
        this.destination.next(value)
      })
    )
  }

  public error(error: unknown): void {
    this.addOnDispose(
      this.__scheduler.schedule(() => {
        this.destination.error(error)
      })
    )
  }

  public complete(): void {
    this.addOnDispose(
      this.__scheduler.schedule(() => {
        this.destination.complete()
      })
    )
  }
}
