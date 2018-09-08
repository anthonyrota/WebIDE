import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { IRequiredSubscriber, ISubscriber } from 'src/models/Stream/ISubscriber'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export class ScheduledSubscriber<T> extends MonoTypeValueTransmitter<T>
  implements IRequiredSubscriber<T> {
  private __scheduler: IScheduler

  constructor(target: ISubscriber<T>, scheduler: IScheduler) {
    super(target)
    this.__scheduler = scheduler
  }

  public next(value: T): void {
    this.add(
      this.__scheduler.schedule(() => {
        this.destination.next(value)
      })
    )
  }

  public error(error: unknown): void {
    this.add(
      this.__scheduler.schedule(() => {
        this.destination.error(error)
      })
    )
  }

  public complete(): void {
    this.add(
      this.__scheduler.schedule(() => {
        this.destination.complete()
      })
    )
  }
}
