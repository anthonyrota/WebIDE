import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function exhaustMap<T, U>(
  convertValueToStream: (value: T, index: number) => Stream<U>
): IOperator<T, U> {
  return new ExhaustMapOperator<T, U>(convertValueToStream)
}

class ExhaustMapOperator<T, U> implements IOperator<T, U> {
  constructor(
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {}

  public connect(target: ISubscriber<U>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new ExhaustMapSubscriber<T, U>(target, this.convertValueToStream)
    )
  }
}

class ExhaustMapSubscriber<T, U> extends DoubleInputValueTransmitter<T, U, U> {
  private hasActiveStream: boolean = false
  private index: number = 0

  constructor(
    target: ISubscriber<U>,
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.hasActiveStream) {
      return
    }

    const { convertValueToStream } = this
    const index = this.index++
    let resultStream: Stream<U>

    try {
      resultStream = convertValueToStream(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.hasActiveStream = true
    this.subscribeStreamToSelf(resultStream)
  }

  protected onComplete(): void {
    if (!this.hasActiveStream) {
      this.destination.complete()
    }
  }

  protected onOuterNextValue(value: U): void {
    this.destination.next(value)
  }

  protected onOuterComplete(): void {
    this.hasActiveStream = false
    if (!this.isReceivingValues()) {
      this.destination.complete()
    }
  }
}
