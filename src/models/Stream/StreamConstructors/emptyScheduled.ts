import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function emptyScheduled(scheduler: IScheduler): Stream<never> {
  return new EmptyScheduledStream(scheduler)
}

class EmptyScheduledStream extends Stream<never> {
  constructor(private __scheduler: IScheduler) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<never>): void {
    this.__scheduler.schedule(target.complete.bind(target))
  }
}
