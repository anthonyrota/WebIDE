import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { DistributedStream } from 'src/models/Stream/DistributedStream'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'

export class DistributedStreamWithLastValue<T> extends DistributedStream<T> {
  private __value: T

  constructor(initialValue: T) {
    super()
    this.__value = initialValue
  }

  public next(value: T): void {
    this.__value = value
    super.next(value)
  }

  public trySubscribe(target: IRequiredSubscriber<T>): DisposableLike {
    if (this.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    this.throwError()

    if (!this.isReceivingValues()) {
      target.complete()
    } else {
      target.next(this.__value)

      return this.pushTarget(target)
    }
  }

  public getValue(): T {
    if (this.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    this.throwError()

    return this.__value
  }
}
