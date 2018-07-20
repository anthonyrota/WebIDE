import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { AsyncActionWithData } from 'src/models/Scheduler/AsyncActionWithData'
import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function fromPromiseScheduled<T>(
  promise: PromiseLike<T>,
  scheduler: IScheduler
): Stream<T> {
  return new FromPromiseScheduledStream<T>(promise, scheduler)
}

class FromPromiseScheduledStream<T> extends Stream<T> {
  constructor(
    private __promise: PromiseLike<T>,
    private __scheduler: IScheduler
  ) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    return this.__scheduler.scheduleWithData<ISchedulerState<T>>(
      scheduleCallback,
      {
        target,
        promise: this.__promise,
        promiseState: { type: 'SubscribeToPromise' }
      }
    )
  }
}

type PromiseState<T> =
  | { type: 'SubscribeToPromise' }
  | { type: 'DistributeValue'; value: T }
  | { type: 'DistributeError'; error: T }
  | { type: 'DistributeCompletion' }

interface ISchedulerState<T> {
  target: MonoTypeValueTransmitter<T>
  promise: PromiseLike<T>
  promiseState: PromiseState<T>
}

function scheduleCallback<T>(
  state: ISchedulerState<T>,
  action: AsyncActionWithData<ISchedulerState<T>>
): void {
  if (!state.target.isReceivingValues()) {
    return
  }

  switch (state.promiseState.type) {
    case 'SubscribeToPromise':
      state.promise.then(
        onValue.bind(null, state, action),
        onError.bind(null, state, action)
      )
      break
    case 'DistributeValue':
      state.target.next(state.promiseState.value)
      state.promiseState = { type: 'DistributeCompletion' }
      action.schedule(state)
      break
    case 'DistributeError':
      state.target.error(state.promiseState.error)
      break
    case 'DistributeCompletion':
      state.target.complete()
      break
  }
}

function onValue<T>(
  state: ISchedulerState<T>,
  action: AsyncActionWithData<ISchedulerState<T>>,
  value: T
): void {
  state.promiseState = {
    type: 'DistributeValue',
    value
  }
  action.schedule(state)
}

function onError<T>(
  state: ISchedulerState<T>,
  action: AsyncActionWithData<ISchedulerState<T>>,
  error: any
) {
  state.promiseState = {
    type: 'DistributeError',
    error
  }
  action.schedule(state)
}
