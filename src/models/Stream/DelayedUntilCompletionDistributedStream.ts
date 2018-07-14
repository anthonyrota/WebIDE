import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { DistributedStream } from 'src/models/Stream/DistributedStream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export class DelayedUntilCompletionDistributedStream<
  T
> extends DistributedStream<T> {
  private __value?: T
  private __hasValue: boolean = false

  public next(value: T): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (!this.isCompleted()) {
      this.__value = value
      this.__hasValue = true
    }
  }

  public complete(): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (!this.isCompleted()) {
      if (this.__hasValue) {
        super.next(this.__value!)
      }

      super.complete()
    }
  }

  public trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.throwError()

    if (!this.isCompleted()) {
      return super.pushTarget(target)
    }

    if (this.__hasValue) {
      target.next(this.__value!)
    }

    target.complete()
  }
}
