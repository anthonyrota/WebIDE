import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  IScheduler,
  ISchedulerActionWithData
} from 'src/models/Scheduler/Scheduler'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function ofScheduled<T>(value: T, scheduler: IScheduler): Stream<T> {
  return new OfScheduledStream<T>(value, scheduler)
}

class OfScheduledStream<T> extends Stream<T> {
  constructor(private __value: T, private __scheduler: IScheduler) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    this.__scheduler.scheduleWithData<ISchedulerState<T>>(scheduleCallback, {
      target,
      value: this.__value,
      scheduleState: ScheduleState.DistributeValue
    })
  }
}

enum ScheduleState {
  DistributeValue,
  DistributeComplete
}

interface ISchedulerState<T> {
  target: MonoTypeValueTransmitter<T>
  value: T
  scheduleState: ScheduleState
}

function scheduleCallback<T>(
  state: ISchedulerState<T>,
  action: ISchedulerActionWithData<ISchedulerState<T>>
): void {
  if (state.scheduleState === ScheduleState.DistributeValue) {
    state.target.next(state.value)
    state.scheduleState = ScheduleState.DistributeComplete
    action.schedule(state)
  } else {
    state.target.complete()
  }
}
