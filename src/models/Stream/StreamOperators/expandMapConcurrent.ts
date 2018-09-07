import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { MonoTypeDoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function expandMapConcurrent<T>(
  convertValueToStream: (value: T, index: number) => Stream<T>,
  concurrency: number
): IOperator<T, T> {
  return new ExpandMapConcurrentOperator<T>(convertValueToStream, concurrency)
}

class ExpandMapConcurrentOperator<T> implements IOperator<T, T> {
  constructor(
    private convertValueToStream: (value: T, index: number) => Stream<T>,
    private concurrency: number
  ) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new ExpandMapConcurrentSubscriber<T>(
        target,
        this.convertValueToStream,
        this.concurrency
      )
    )
  }
}

class ExpandMapConcurrentSubscriber<
  T
> extends MonoTypeDoubleInputValueTransmitter<T> {
  private valuesToProcess: T[] = []
  private activeMergedStreamsCount: number = 0
  private index: number = 0

  constructor(
    target: ISubscriber<T>,
    private convertValueToStream: (value: T, index: number) => Stream<T>,
    private concurrency: number
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.activeMergedStreamsCount < this.concurrency) {
      this.processValue(value)
    } else {
      this.valuesToProcess.push(value)
    }
  }

  protected onComplete(): void {
    if (
      this.activeMergedStreamsCount === 0 &&
      this.valuesToProcess.length === 0
    ) {
      this.destination.complete()
    }
  }

  protected onOuterNextValue(value: T): void {
    this.onNextValue(value)
  }

  protected onOuterComplete(): void {
    this.activeMergedStreamsCount -= 1

    if (this.valuesToProcess.length > 0) {
      this.processValue(this.valuesToProcess.shift()!)
    } else if (
      this.activeMergedStreamsCount === 0 &&
      !this.isReceivingValues()
    ) {
      this.destination.complete()
    }
  }

  private processValue(value: T): void {
    const { convertValueToStream } = this
    const index = this.index++
    let resultStream: Stream<T>

    try {
      resultStream = convertValueToStream(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.activeMergedStreamsCount += 1
    this.subscribeStreamToSelf(resultStream)
  }
}
