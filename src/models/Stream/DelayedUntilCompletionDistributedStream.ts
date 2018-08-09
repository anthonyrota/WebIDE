import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { DistributedStream } from 'src/models/Stream/DistributedStream'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'

export class DelayedUntilCompletionDistributedStream<
  T
> extends DistributedStream<T> {
  private __value?: T
  private __hasValue: boolean = false

  public next(value: T): void {
    if (this.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    if (this.isReceivingValues()) {
      this.__value = value
      this.__hasValue = true
    }
  }

  public complete(): void {
    if (this.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    if (this.isReceivingValues()) {
      if (this.__hasValue) {
        super.next(this.__value!)
      }

      super.complete()
    }
  }

  public trySubscribe(target: IRequiredSubscriber<T>): IDisposableLike {
    if (this.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    this.throwError()

    if (this.isReceivingValues()) {
      return super.pushTarget(target)
    }

    if (this.__hasValue) {
      target.next(this.__value!)
    }

    target.complete()
  }
}
