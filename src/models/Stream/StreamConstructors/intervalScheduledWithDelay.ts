import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  IScheduler,
  ISchedulerActionWithData
} from 'src/models/Scheduler/Scheduler'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function intervalScheduled(
  scheduler: IScheduler,
  delay: number
): Stream<number> {
  return new IntervalScheduledStream(scheduler, delay)
}

class IntervalScheduledStream extends Stream<number> {
  constructor(private __scheduler: IScheduler, private __delay: number) {
    super()
  }

  protected trySubscribe(
    target: MonoTypeValueTransmitter<number>
  ): IDisposableLike {
    return this.__scheduler.scheduleDelayedWithData<ISchedulerState>(
      scheduleCallback,
      {
        target,
        delay: this.__delay,
        counter: 0
      },
      this.__delay
    )
  }
}

interface ISchedulerState {
  target: MonoTypeValueTransmitter<number>
  counter: number
  delay: number
}

function scheduleCallback(
  state: ISchedulerState,
  action: ISchedulerActionWithData<ISchedulerState>
): void {
  state.target.next(state.counter)
  state.counter++
  action.scheduleDelayed(state, state.delay)
}
