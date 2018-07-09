import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  IDoubleStreamSubscriber,
  subscribeStreamToDoubleStreamSubscriber
} from 'src/models/Stream/DoubleStreamSubscriber'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { StreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const mergeMap: {
  <T, U>(convertValueToStream: (value: T, index: number) => Stream<U>): (
    source: Stream<T>
  ) => Stream<U>
  <T, U>(
    convertValueToStream: (value: T, index: number) => Stream<U>,
    source: Stream<T>
  ): Stream<U>
} = curry2(
  <T, U>(
    convertValueToStream: (value: T, index: number) => Stream<U>,
    source: Stream<T>
  ): Stream<U> => {
    return source.lift(new MergeMapOperator<T, U>(convertValueToStream))
  }
)

class MergeMapOperator<T, U> implements IOperator<T, U> {
  constructor(
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {}

  public call(
    target: StreamSubscriptionTarget<U>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new MergeMapSubscriber<T, U>(target, this.convertValueToStream)
    )
  }
}

/**
 * @todo refactor IDOubleStreamSubscriber<T> into its own extensible class
 */
class MergeMapSubscriber<T, U> extends StreamValueTransmitter<T, U>
  implements IDoubleStreamSubscriber<U> {
  private hasSourceCompleted: boolean = false
  private activeMergedStreamsCount: number = 0
  private index: number = 0

  constructor(
    target: IStreamSubscriber<U>,
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {
    super(target)
  }

  public onOuterNextValue(value: U): void {
    this.destination.next(value)
  }

  public onOuterComplete(): void {
    this.activeMergedStreamsCount -= 1

    if (this.activeMergedStreamsCount === 0 && this.hasSourceCompleted) {
      this.destination.complete()
    }
  }

  protected onNextValue(value: T): void {
    const { convertValueToStream } = this
    const index = this.index++
    let resultStream: Stream<U>

    try {
      resultStream = convertValueToStream(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.activeMergedStreamsCount += 1
    this.terminateDisposableWhenDisposed(
      subscribeStreamToDoubleStreamSubscriber(resultStream, this)
    )
  }

  protected onComplete(): void {
    this.hasSourceCompleted = true

    if (this.activeMergedStreamsCount === 0) {
      this.destination.complete()
    }
  }
}
