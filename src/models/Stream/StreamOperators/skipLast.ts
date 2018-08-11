import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { copySource } from 'src/models/Stream/StreamOperators/copySource'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function skipLast<T>(total: number): IOperator<T, T> {
  if (total < 0) {
    throw new TypeError('total must be positive')
  }
  if (total === 0) {
    return copySource()
  }
  return new SkipLastOperator<T>(total)
}

class SkipLastOperator<T> implements IOperator<T, T> {
  constructor(private total: number) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new SkipLastSubscriber<T>(target, this.total))
  }
}

class SkipLastSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private values: T[] = []

  constructor(target: ISubscriber<T>, private total: number) {
    super(target)
  }

  public onNextValue(value: T): void {
    this.values.push(value)

    if (this.values.length > this.total) {
      this.destination.next(this.values.shift()!)
    }
  }
}
