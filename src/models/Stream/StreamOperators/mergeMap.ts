import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { DoubleInputValueTransmitterWithSameOutputAndOuterTypes } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
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
    target: MonoTypeValueTransmitter<U>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new MergeMapSubscriber<T, U>(target, this.convertValueToStream)
    )
  }
}

class MergeMapSubscriber<
  T,
  U
> extends DoubleInputValueTransmitterWithSameOutputAndOuterTypes<T, U> {
  private activeMergedStreamsCount: number = 0
  private index: number = 0

  constructor(
    target: ISubscriber<U>,
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {
    super(target)
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
    this.subscribeStreamToSelf(resultStream)
  }

  protected onComplete(): void {
    if (this.activeMergedStreamsCount === 0) {
      this.destination.complete()
    }
  }

  protected onOuterComplete(): void {
    this.activeMergedStreamsCount -= 1

    if (this.activeMergedStreamsCount === 0 && !this.isReceivingValues()) {
      this.destination.complete()
    }
  }
}
