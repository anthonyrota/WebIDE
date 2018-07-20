import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  IScheduler,
  ISchedulerActionWithData
} from 'src/models/Scheduler/Scheduler'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { callIteratorReturn } from 'src/utils/callIteratorReturn'
import { $$iterator } from 'src/utils/iteratorSymbol'

export function fromIteratorScheduled<T>(
  iterable: Iterable<T>,
  scheduler: IScheduler
): Stream<T> {
  return new FromIterableScheduledStream<T>(iterable, scheduler)
}

class FromIterableScheduledStream<T> extends Stream<T> {
  constructor(
    private __iterable: Iterable<T>,
    private __scheduler: IScheduler
  ) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    return this.__scheduler.scheduleWithData<ISchedulerState<T>>(
      scheduleCallback,
      {
        target,
        iterable: this.__iterable,
        iterator: null
      }
    )
  }
}

interface ISchedulerState<T> {
  target: MonoTypeValueTransmitter<T>
  iterable: Iterable<T>
  iterator: IterableIterator<T> | null
}

function scheduleCallback<T>(
  state: ISchedulerState<T>,
  action: ISchedulerActionWithData<ISchedulerState<T>>
): void {
  if (!state.iterator) {
    state.iterator = state.iterable[$$iterator]()
    state.target.onDispose(callIteratorReturn.bind(null, state.iterator))
    action.schedule(state)
    return
  }

  let result: IteratorResult<T>

  try {
    result = state.iterator.next()
  } catch (error) {
    state.target.error(error)
    return
  }

  if (result.done) {
    state.target.complete()
  } else {
    state.target.next(result.value)
    action.schedule(state)
  }
}
