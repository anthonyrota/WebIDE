import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function repeat<T>(count: number): IOperator<T, T> {
  if (count < 0) {
    throw new TypeError('count must be positive')
  }
  return new RepeatOperator<T>(count)
}

class RepeatOperator<T> implements IOperator<T, T> {
  constructor(private count: number) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new RepeatSubscriber<T>(target, this.count, source))
  }
}

class RepeatSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(
    target: ISubscriber<T>,
    private count: number,
    private source: Stream<T>
  ) {
    super(target)
  }

  public complete(): void {
    if (this.isActive()) {
      if (this.count === 0) {
        this.destination.complete()
        return
      }

      this.count -= 1
      this.disposeAndRecycle()
      this.source.subscribe(this)
    }
  }
}
