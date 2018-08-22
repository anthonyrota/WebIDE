import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { MonoTypeDoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function expand<T>(
  convertValueToStream: (value: T, index: number) => Stream<T>
): IOperator<T, T> {
  return new ExpandOperator<T>(convertValueToStream)
}

class ExpandOperator<T> implements IOperator<T, T> {
  constructor(
    private convertValueToStream: (value: T, index: number) => Stream<T>
  ) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new ExpandSubscriber<T>(target, this.convertValueToStream)
    )
  }
}

class ExpandSubscriber<T> extends MonoTypeDoubleInputValueTransmitter<T> {
  private activeMergedStreamsCount: number = 0
  private index: number = 0

  constructor(
    target: ISubscriber<T>,
    private convertValueToStream: (value: T, index: number) => Stream<T>
  ) {
    super(target)
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

    this.activeMergedStreamsCount += 1
    this.subscribeStreamToSelf(resultStream)
  }

  protected onComplete(): void {
    if (this.activeMergedStreamsCount === 0) {
      this.destination.complete()
    }
  }

  protected onOuterNextValue(value: T): void {
    this.onNextValue(value)
  }

  protected onOuterComplete(): void {
    this.activeMergedStreamsCount -= 1

    if (this.activeMergedStreamsCount === 0 && !this.isReceivingValues()) {
      this.destination.complete()
    }
  }
}
