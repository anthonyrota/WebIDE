import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { ScheduledSubscriber } from 'src/models/Stream/ScheduledSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function fromStreamScheduled<T>(
  source: Stream<T>,
  scheduler: IScheduler
): Stream<T> {
  return new FromStreamScheduled<T>(source, scheduler)
}

class FromStreamScheduled<T> extends Stream<T> {
  constructor(private __source: Stream<T>, private __scheduler: IScheduler) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    return this.__source.subscribe(
      new ScheduledSubscriber<T>(target, this.__scheduler)
    )
  }
}
