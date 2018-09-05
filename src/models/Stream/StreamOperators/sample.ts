import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function sample<T>(
  shouldEmitValueStream: Stream<unknown>
): IOperator<T, T> {
  return new SampleOperator<T>(shouldEmitValueStream)
}

class SampleOperator<T> implements IOperator<T, T> {
  constructor(private shouldEmitValueStream: Stream<unknown>) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return new SampleSubscriber<T>(target, this.shouldEmitValueStream, source)
  }
}

class SampleSubscriber<T> extends DoubleInputValueTransmitter<T, T, unknown> {
  private lastValue: T | null = null
  private hasValue: boolean = false

  constructor(
    target: ISubscriber<T>,
    shouldEmitValueStream: Stream<unknown>,
    source: Stream<T>
  ) {
    super(target)

    source.subscribe(this)
    this.subscribeStreamToSelf(shouldEmitValueStream)
  }

  protected onNextValue(value: T): void {
    this.hasValue = true
    this.lastValue = value
  }

  protected onOuterNextValue(): void {
    this.emitValue()
  }

  protected onOuterComplete(): void {
    this.emitValue()
  }

  private emitValue(): void {
    if (this.hasValue) {
      this.hasValue = false
      this.destination.next(this.lastValue!)
    }
  }
}
