import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import {
  IScheduler,
  ISchedulerActionWithData
} from 'src/models/Scheduler/Scheduler'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function sampleTime<T>(
  emitValuePeriod: number,
  scheduler: IScheduler
): IOperator<T, T> {
  return new SampleTimeOperator<T>(emitValuePeriod, scheduler)
}

class SampleTimeOperator<T> implements IOperator<T, T> {
  constructor(private emitValuePeriod: number, private scheduler: IScheduler) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return new SampleTimeSubscriber<T>(
      target,
      this.emitValuePeriod,
      this.scheduler,
      source
    )
  }
}

class SampleTimeSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private lastValue: T | null = null
  private hasValue: boolean = false

  constructor(
    target: ISubscriber<T>,
    private emitValuePeriod: number,
    scheduler: IScheduler,
    source: Stream<T>
  ) {
    super(target)

    source.subscribe(this)
    this.add(
      scheduler.scheduleDelayedWithData<SampleTimeSubscriber<T>>(
        SampleTimeSubscriber.schedulerCallback,
        emitValuePeriod,
        this
      )
    )
  }

  private static schedulerCallback<T>(
    transmitter: SampleTimeSubscriber<T>,
    action: ISchedulerActionWithData<SampleTimeSubscriber<T>>
  ): void {
    transmitter.emitValue()
    action.scheduleDelayedWithData(transmitter.emitValuePeriod, transmitter)
  }

  protected onNextValue(value: T): void {
    this.hasValue = true
    this.lastValue = value
  }

  private emitValue(): void {
    if (this.hasValue) {
      this.hasValue = false
      this.destination.next(this.lastValue!)
    }
  }
}
