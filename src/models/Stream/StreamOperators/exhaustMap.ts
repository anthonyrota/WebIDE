import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function exhaustMap<T, U>(
  convertValueToStream: (value: T, index: number) => Stream<U>
): IConnectOperator<T, U> {
  return new ExhaustMapOperator<T, U>(convertValueToStream)
}

class ExhaustMapOperator<T, U> implements IConnectOperator<T, U> {
  constructor(
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {}

  public connect(
    target: MonoTypeValueTransmitter<U>,
    source: Stream<T>
  ): IDisposableLike {
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
