import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { DistributedStream } from 'src/models/Stream/DistributedStream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

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

  public trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    if (this.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    this.throwError()

    if (this.isCompleted()) {
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
