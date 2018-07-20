import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  IScheduler,
  ISchedulerActionWithData
} from 'src/models/Scheduler/Scheduler'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function intervalScheduled(scheduler: IScheduler): Stream<number> {
  return new IntervalScheduledStream(scheduler)
}

class IntervalScheduledStream extends Stream<number> {
  constructor(private __scheduler: IScheduler) {
    super()
  }

  protected trySubscribe(
    target: MonoTypeValueTransmitter<number>
  ): IDisposableLike {
    return this.__scheduler.scheduleWithData<ISchedulerState>(
      scheduleCallback,
      {
        target,
        counter: 0
      }
    )
  }
}

interface ISchedulerState {
  target: MonoTypeValueTransmitter<number>
  counter: number
}

function scheduleCallback(
  state: ISchedulerState,
  action: ISchedulerActionWithData<ISchedulerState>
): void {
  state.target.next(state.counter)
  state.counter++
  action.schedule(state)
}
