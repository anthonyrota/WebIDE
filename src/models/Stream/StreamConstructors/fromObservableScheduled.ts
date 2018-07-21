import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  IScheduler,
  ISchedulerActionWithData
} from 'src/models/Scheduler/Scheduler'
import { IESInteropObservable } from 'src/models/Stream/ESObservable'
import { ESObservableSubscriptionDisposable } from 'src/models/Stream/ESObservableSubscriptionDisposable'
import { ScheduledSubscriber } from 'src/models/Stream/ScheduledSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { toESObservable } from 'src/utils/toESObservable'

export function fromObservableScheduled<T>(
  input: IESInteropObservable<T>,
  scheduler: IScheduler
): Stream<T> {
  return new FromObservableScheduledStream<T>(input, scheduler)
}

export class FromObservableScheduledStream<T> extends Stream<T> {
  constructor(
    private __input: IESInteropObservable<T>,
    private __scheduler: IScheduler
  ) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    return this.__scheduler.scheduleWithData<ISchedulerData<T>>(
      scheduleCallback,
      {
        target,
        input: this.__input,
        scheduler: this.__scheduler
      }
    )
  }
}

interface ISchedulerData<T> {
  target: MonoTypeValueTransmitter<T>
  input: IESInteropObservable<T>
  scheduler: IScheduler
}

function scheduleCallback<T>(
  data: ISchedulerData<T>,
  action: ISchedulerActionWithData<ISchedulerData<T>>
): void {
  action.terminateDisposableWhenDisposed(
    new ESObservableSubscriptionDisposable(
      toESObservable<T>(data.input).subscribe(
        new ScheduledSubscriber<T>(data.target, data.scheduler)
      )
    )
  )
}
