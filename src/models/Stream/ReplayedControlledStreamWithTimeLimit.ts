import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ControlledStream } from 'src/models/Stream/ControlledStream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { getTime } from 'src/utils/getTime'

interface IReplayBufferValue<T> {
  value: T
  createdAt: number
}

export class ReplayedControlledStreamWithTimeLimit<T> extends ControlledStream<
  T
> {
  private __buffer: Array<IReplayBufferValue<T>> = []
  private __bufferSize: number
  private __timeLimit: number

  constructor(
    timeLimit: number,
    bufferSize: number = Number.POSITIVE_INFINITY
  ) {
    super()
    this.__bufferSize = bufferSize
    this.__timeLimit = timeLimit
  }

  protected onNextValue(value: T): void {
    this.__buffer.push({
      value,
      createdAt: getTime()
    })

    this.__trimBuffer()
    super.onNextValue(value)
  }

  protected trySubscribe(target: ValueTransmitter<T, unknown>): DisposableLike {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.__trimBuffer()

    for (let i = 0; i < this.__buffer.length; i++) {
      target.next(this.__buffer[i].value)
    }

    this.getError().withValue(error => {
      throw error
    })

    if (this.isReceivingValues()) {
      return this.pushTarget(target)
    }

    target.complete()
  }

  private __trimBuffer(): void {
    const now = getTime()
    let amountToSplice = 0

    while (amountToSplice < this.__buffer.length) {
      if (now - this.__buffer[amountToSplice].createdAt < this.__timeLimit) {
        break
      }

      amountToSplice += 1
    }

    if (this.__buffer.length > this.__bufferSize) {
      amountToSplice = Math.max(
        amountToSplice,
        this.__buffer.length - this.__bufferSize
      )
    }

    if (amountToSplice > 0) {
      this.__buffer.splice(0, amountToSplice)
    }
  }
}
