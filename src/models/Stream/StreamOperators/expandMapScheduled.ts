import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { MonoTypeDoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function expandMapScheduled<T>(
  convertValueToStream: (value: T, index: number) => Stream<T>,
  scheduler: IScheduler
): IOperator<T, T> {
  return new ExpandMapScheduledOperator<T>(convertValueToStream, scheduler)
}

class ExpandMapScheduledOperator<T> implements IOperator<T, T> {
  constructor(
    private convertValueToStream: (value: T, index: number) => Stream<T>,
    private scheduler: IScheduler
  ) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new ExpandMapScheduledSubscriber<T>(
        target,
        this.convertValueToStream,
        this.scheduler
      )
    )
  }
}

interface ISchedulerData<T> {
  transmitter: ExpandMapScheduledSubscriber<T>
  resultStream: Stream<T>
}

class ExpandMapScheduledSubscriber<
  T
> extends MonoTypeDoubleInputValueTransmitter<T> {
  private activeMergedStreamsCount: number = 0
  private scheduledStreamsToMergeCount: number = 0
  private index: number = 0

  constructor(
    target: ISubscriber<T>,
    private convertValueToStream: (value: T, index: number) => Stream<T>,
    private scheduler: IScheduler
  ) {
    super(target)
  }

  private static schedulerCallback<T>(data: ISchedulerData<T>): void {
    data.transmitter.scheduledStreamsToMergeCount -= 1
    data.transmitter.subscribeResultStreamToSelf(data.resultStream)
  }

  protected onNextValue(value: T): void {
    const { convertValueToStream } = this
    const index = this.index++
    let resultStream: Stream<T>

    try {
      resultStream = convertValueToStream(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.scheduledStreamsToMergeCount += 1
    this.terminateDisposableWhenDisposed(
      this.scheduler.scheduleWithData<ISchedulerData<T>>(
        ExpandMapScheduledSubscriber.schedulerCallback,
        { transmitter: this, resultStream }
      )
    )
  }

  protected onComplete(): void {
    if (
      this.activeMergedStreamsCount === 0 &&
      this.scheduledStreamsToMergeCount === 0
    ) {
      this.destination.complete()
    }
  }

  protected onOuterNextValue(value: T): void {
    this.onNextValue(value)
  }

  protected onOuterComplete(): void {
    this.activeMergedStreamsCount -= 1

    if (
      this.activeMergedStreamsCount === 0 &&
      this.scheduledStreamsToMergeCount === 0 &&
      !this.isReceivingValues()
    ) {
      this.destination.complete()
    }
  }

  private subscribeResultStreamToSelf(resultStream: Stream<T>): void {
    this.activeMergedStreamsCount += 1
    this.subscribeStreamToSelf(resultStream)
  }
}
