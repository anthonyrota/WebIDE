import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { ControlledStream, IControlledStream } from '../ControlledStream'
import { Stream } from '../Stream'

export function windowCountWithOverlapOffset<T>(
  windowSize: number,
  windowOffset: number
): Operation<T, Stream<T>> {
  return operateThroughValueTransmitter(
    target =>
      new WindowCountWithOverlapOffsetValueTransmitter(
        target,
        windowSize,
        windowOffset
      )
  )
}

class WindowCountWithOverlapOffsetValueTransmitter<T> extends ValueTransmitter<
  T,
  Stream<T>
> {
  private windows: Array<IControlledStream<T, T>> = [new ControlledStream<T>()]
  private receivedValuesCount: number = 0

  constructor(
    target: ISubscriptionTarget<Stream<T>>,
    private maxWindowSize: number,
    private windowOffset: number
  ) {
    super(target)
    this.destination.next(this.windows[0])
  }

  protected onNextValue(value: T): void {
    for (let i = 0; i < this.windows.length; i++) {
      this.windows[i].next(value)
    }

    this.receivedValuesCount += 1

    const receivedValuesCountExcludingFirstWindow =
      this.receivedValuesCount - this.maxWindowSize

    if (
      receivedValuesCountExcludingFirstWindow >= 0 &&
      receivedValuesCountExcludingFirstWindow % this.windowOffset === 0
    ) {
      this.closeWindow()
    }

    if (this.receivedValuesCount % this.windowOffset === 0) {
      this.openWindow()
    }
  }

  protected onError(error: unknown): void {
    for (let i = 0; i < this.windows.length; i++) {
      this.windows[i].error(error)
    }
    this.destination.error(error)
  }

  protected onComplete(): void {
    for (let i = 0; i < this.windows.length; i++) {
      this.windows[i].complete()
    }
    this.destination.complete()
  }

  private closeWindow(): void {
    if (this.isActive()) {
      const window = this.windows.shift()

      if (window) {
        window.complete()
      }
    }
  }

  private openWindow(): void {
    if (this.isActive()) {
      const window = new ControlledStream<T>()

      this.windows.push(window)
      this.destination.next(window)
    }
  }
}
