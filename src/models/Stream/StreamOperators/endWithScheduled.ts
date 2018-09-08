import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import {
  IScheduler,
  ISchedulerActionWithData
} from 'src/models/Scheduler/Scheduler'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function endWithScheduled<T>(
  values: T[],
  scheduler: IScheduler
): IOperator<T, T> {
  return new EndWithScheduledOperator<T>(values, scheduler)
}

class EndWithScheduledOperator<T> implements IOperator<T, T> {
  constructor(private values: T[], private scheduler: IScheduler) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new EndWithScheduledSubscriber(target, this.values, this.scheduler)
    )
  }
}

class EndWithScheduledSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private index: number = 0

  constructor(
    target: ISubscriber<T>,
    private values: T[],
    private scheduler: IScheduler
  ) {
    super(target)
  }

  private static schedulerCallback<T>(
    transmitter: EndWithScheduledSubscriber<T>,
    action: ISchedulerActionWithData<EndWithScheduledSubscriber<T>>
  ): void {
    if (transmitter.index >= transmitter.values.length) {
      transmitter.destination.complete()
    } else {
      transmitter.destination.next(transmitter.values[transmitter.index++])
      action.scheduleWithData(transmitter)
    }
  }

  protected onComplete(): void {
    if (this.values.length === 0) {
      this.destination.complete()
      return
    }

    this.add(
      this.scheduler.scheduleWithData<EndWithScheduledSubscriber<T>>(
        EndWithScheduledSubscriber.schedulerCallback,
        this
      )
    )
  }
}
