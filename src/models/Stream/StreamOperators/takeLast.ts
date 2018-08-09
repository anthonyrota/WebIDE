import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { completeImmediately } from 'src/models/Stream/StreamOperators/completeImmediately'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function take<T>(total: number): IOperator<T, T> {
  if (total < 0) {
    throw new TypeError('total must be positive')
  }
  if (total === 0) {
    return completeImmediately()
  }
  return new TakeOperator<T>(total)
}

class TakeOperator<T> implements IOperator<T, T> {
  constructor(private total: number) {}

  public connect(
    target: ISubscriber<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new TakeSubscriber<T>(target, this.total))
  }
}

class TakeSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private lastValues: T[] = []

  constructor(target: ISubscriber<T>, private total: number) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.lastValues.length === this.total) {
      this.lastValues.shift()
    }

    this.lastValues.push(value)
  }

  protected onComplete(): void {
    for (let i = 0; i < this.lastValues.length; i++) {
      this.destination.next(this.lastValues[i])
    }
    this.destination.complete()
  }
}
