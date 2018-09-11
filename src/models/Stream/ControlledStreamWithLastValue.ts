import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ControlledStream } from 'src/models/Stream/ControlledStream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export class ControlledStreamWithLastValue<T> extends ControlledStream<T> {
  private __value: T

  constructor(initialValue: T) {
    super()
    this.__value = initialValue
  }

  public next(value: T): void {
    this.__value = value
    super.next(value)
  }

  public trySubscribe(target: ValueTransmitter<T, unknown>): DisposableLike {
    if (!this.isActive()) {
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
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.throwError()

    return this.__value
  }
}
