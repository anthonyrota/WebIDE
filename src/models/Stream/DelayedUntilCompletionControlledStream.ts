import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ControlledStream } from 'src/models/Stream/ControlledStream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export class DelayedUntilCompletionControlledStream<T> extends ControlledStream<
  T
> {
  private __value?: T
  private __hasValue: boolean = false

  public next(value: T): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (this.isReceivingValues()) {
      this.__value = value
      this.__hasValue = true
    }
  }

  public complete(): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (this.isReceivingValues()) {
      if (this.__hasValue) {
        super.next(this.__value!)
      }

      super.complete()
    }
  }

  public trySubscribe(target: ValueTransmitter<T, unknown>): DisposableLike {
    if (!this.isActive()) {
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
