import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { ControlledStream } from '../ControlledStream'
import { Stream } from '../Stream'

export function windowCount<T>(windowSize: number): Operation<T, Stream<T>> {
  return operateThroughValueTransmitter(
    target => new WindowCountValueTransmitter(target, windowSize)
  )
}

class WindowCountValueTransmitter<T> extends ValueTransmitter<T, Stream<T>> {
  private currentWindow: ControlledStream<T> = new ControlledStream<T>()
  private currentWindowSize: number = 0

  constructor(
    target: ISubscriptionTarget<Stream<T>>,
    private maxWindowSize: number
  ) {
    super(target)
    this.destination.next(this.currentWindow)
  }

  protected onNextValue(value: T): void {
    this.currentWindow.next(value)
    this.currentWindowSize += 1

    if (this.currentWindowSize === this.maxWindowSize && this.isActive()) {
      this.currentWindow.complete()
      this.currentWindow = new ControlledStream<T>()
      this.destination.next(this.currentWindow)
    }
  }

  protected onError(error: unknown): void {
    this.currentWindow.error(error)
    this.destination.error(error)
  }

  protected onComplete(): void {
    this.currentWindow.complete()
    this.destination.complete()
  }
}
