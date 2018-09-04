import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function repeatAlways<T>(): IOperator<T, T> {
  return new RepeatAlwaysOperator<T>()
}

class RepeatAlwaysOperator<T> implements IOperator<T, T> {
  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new RepeatAlwaysSubscriber<T>(target, source))
  }
}

class RepeatAlwaysSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, private source: Stream<T>) {
    super(target)
  }

  public complete(): void {
    if (this.isActive()) {
      this.disposeAndRecycle()
      this.source.subscribe(this)
    }
  }
}
