import { IDisposable } from 'src/models/Disposable/IDisposable'
import { ControlledStream, IControlledStream } from '../ControlledStream'
import { DoubleInputValueTransmitter } from '../DoubleInputValueTransmitter'
import { ISubscriptionTarget } from '../ISubscriptionTarget'
import { operateThroughValueTransmitter, Operation } from '../Operation'
import { Stream } from '../Stream'

export function windowWhen<T>(
  getShouldCloseWindowStream: () => Stream<unknown>
): Operation<T, Stream<T>> {
  return operateThroughValueTransmitter(
    target => new WindowWhenValueTransmitter(target, getShouldCloseWindowStream)
  )
}

class WindowWhenValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  Stream<T>,
  unknown
> {
  private currentWindow: IControlledStream<T, T> = new ControlledStream<T>()
  private shouldCloseWindowStreamSubscription: IDisposable | null = null

  constructor(
    target: ISubscriptionTarget<Stream<T>>,
    private getShouldCloseWindowStream: () => Stream<unknown>
  ) {
    super(target)
    this.openWindow()
  }

  protected onNextValue(value: T): void {
    this.currentWindow.next(value)
  }

  protected onError(error: unknown): void {
    this.currentWindow.error(error)
    this.destination.error(error)
  }

  protected onComplete(): void {
    this.currentWindow.complete()
    this.destination.complete()
  }

  protected onOuterNextValue(): void {
    this.closeWindow()
    this.openWindow()
  }

  protected onOuterComplete(): void {
    this.closeWindow()
    this.openWindow()
  }

  private closeWindow(): void {
    if (this.shouldCloseWindowStreamSubscription) {
      this.shouldCloseWindowStreamSubscription.dispose()
      this.shouldCloseWindowStreamSubscription = null
    }

    this.currentWindow.complete()
    this.currentWindow = new ControlledStream<T>()
  }

  private openWindow(): void {
    this.destination.next(this.currentWindow)

    const { getShouldCloseWindowStream } = this
    let shouldCloseWindowStream: Stream<unknown>

    try {
      shouldCloseWindowStream = getShouldCloseWindowStream()
    } catch (error) {
      this.currentWindow.error(error)
      this.destination.error(error)
      return
    }

    this.shouldCloseWindowStreamSubscription = this.subscribeStreamToSelf(
      shouldCloseWindowStream
    )
  }
}
