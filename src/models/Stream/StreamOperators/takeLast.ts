import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { completeImmediately } from 'src/models/Stream/StreamOperators/completeImmediately'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function takeLast<T>(total: number): IOperator<T, T> {
  if (total < 0) {
    throw new TypeError('total must be positive')
  }
  if (total === 0) {
    return completeImmediately()
  }
  return new TakeLastOperator<T>(total)
}

class TakeLastOperator<T> implements IOperator<T, T> {
  constructor(private total: number) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new TakeLastSubscriber<T>(target, this.total))
  }
}

class TakeLastSubscriber<T> extends MonoTypeValueTransmitter<T> {
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
