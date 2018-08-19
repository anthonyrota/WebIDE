import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function endWith<T>(...values: T[]): IOperator<T, T> {
  return new EndWithOperator(values)
}

class EndWithOperator<T> implements IOperator<T, T> {
  constructor(private values: T[]) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new EndWithSubscriber(target, this.values))
  }
}

class EndWithSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, private values: T[]) {
    super(target)
  }

  protected onComplete(): void {
    for (let i = 0; i < this.values.length; i++) {
      this.destination.next(this.values[i])
    }
    this.destination.complete()
  }
}
