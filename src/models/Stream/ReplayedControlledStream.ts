import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ControlledStream } from 'src/models/Stream/ControlledStream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export class ReplayedControlledStream<T> extends ControlledStream<T> {
  private __buffer: T[] = []
  private __bufferSize: number

  constructor(bufferSize: number = Number.POSITIVE_INFINITY) {
    super()
    this.__bufferSize = bufferSize
  }

  protected onNextValue(value: T): void {
    this.__buffer.push(value)

    if (this.__buffer.length > this.__bufferSize) {
      this.__buffer.shift()
    }

    super.onNextValue(value)
  }

  protected trySubscribe(target: ValueTransmitter<T, unknown>): DisposableLike {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    for (let i = 0; i < this.__buffer.length; i++) {
      target.next(this.__buffer[i])
    }

    this.getError().withValue(error => {
      throw error
    })

    if (this.isReceivingValues()) {
      return super.pushTarget(target)
    }

    target.complete()
  }
}
