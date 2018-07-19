import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  IScheduler,
  ISchedulerActionWithData
} from 'src/models/Scheduler/Scheduler'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function fromArrayScheduled<T>(
  array: ArrayLike<T>,
  scheduler: IScheduler
): Stream<T> {
  return new FromArrayScheduledStream<T>(array, scheduler)
}

class FromArrayScheduledStream<T> extends Stream<T> {
  constructor(
    private __inputArray: ArrayLike<T>,
    private __scheduler: IScheduler
  ) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    return this.__scheduler.scheduleWithData<ISchedulerState<T>>(
      scheduleCallback,
      {
        target,
        inputArray: this.__inputArray,
        index: 0
      }
    )
  }
}

interface ISchedulerState<T> {
  target: MonoTypeValueTransmitter<T>
  inputArray: ArrayLike<T>
  index: number
}

function scheduleCallback<T>(
  state: ISchedulerState<T>,
  action: ISchedulerActionWithData<ISchedulerState<T>>
) {
  if (state.index >= state.inputArray.length) {
    state.target.complete()
    return
  }

  state.target.next(state.inputArray[state.index++])
  action.schedule(state)
}
