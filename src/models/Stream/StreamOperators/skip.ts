import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { copySource } from 'src/models/Stream/StreamOperators/copySource'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function skip<T>(total: number): IOperator<T, T> {
  if (total < 0) {
    throw new TypeError('total must be positive')
  }
  if (total === 0) {
    return copySource()
  }
  return new SkipOperator<T>(total)
}

class SkipOperator<T> implements IOperator<T, T> {
  constructor(private total: number) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new SkipSubscriber<T>(target, this.total))
  }
}

class SkipSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private count: number = 0

  constructor(target: ISubscriber<T>, private total: number) {
    super(target)
  }

  public onNextValue(value: T): void {
    this.count++

    if (this.count > this.total) {
      this.destination.next(value)
    }
  }
}
