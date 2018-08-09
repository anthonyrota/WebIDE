import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function concatMap<T, U>(
  convertValueToStream: (value: T, index: number) => Stream<U>
): IOperator<T, U> {
  return new ConcatMapOperator<T, U>(convertValueToStream)
}

class ConcatMapOperator<T, U> implements IOperator<T, U> {
  constructor(
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {}

  public connect(target: ISubscriber<U>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new ConcatMapSubscriber<T, U>(target, this.convertValueToStream)
    )
  }
}

class ConcatMapSubscriber<T, U> extends DoubleInputValueTransmitter<T, U, U> {
  private valuesToProcess: T[] = []
  private activeMergedStreamsCount: 0 | 1 = 0
  private index: number = 0

  constructor(
    target: ISubscriber<U>,
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.activeMergedStreamsCount === 0) {
      this.processInnerValue(value)
    } else {
      this.valuesToProcess.push(value)
    }
  }

  protected onOuterNextValue(value: U): void {
    this.destination.next(value)
  }

  protected onOuterComplete(): void {
    this.activeMergedStreamsCount = 0

    if (this.valuesToProcess.length > 0) {
      this.processInnerValue(this.valuesToProcess.shift()!)
    } else if (!this.isReceivingValues()) {
      this.destination.complete()
    }
  }

  private processInnerValue(value: T): void {
    const { convertValueToStream } = this
    const index = this.index++
    let resultStream: Stream<U>

    try {
      resultStream = convertValueToStream(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.activeMergedStreamsCount = 1
    this.subscribeStreamToSelf(resultStream)
  }
}
