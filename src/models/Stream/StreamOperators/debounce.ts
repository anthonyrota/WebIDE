import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function debounce<T>(
  getDurationStream: (value: T) => Stream<unknown>
): IOperator<T, T> {
  return new DebounceOperator<T>(getDurationStream)
}

class DebounceOperator<T> implements IOperator<T, T> {
  constructor(private getDurationStream: (value: T) => Stream<unknown>) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new DebounceSubscriber<T>(target, this.getDurationStream)
    )
  }
}

class DebounceSubscriber<T> extends DoubleInputValueTransmitter<T, T, unknown> {
  private value: T | null = null
  private hasValue: boolean = false
  private durationStreamSubscription: IDisposable | null = null

  constructor(
    target: ISubscriber<T>,
    private getDurationStream: (value: T) => Stream<unknown>
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { getDurationStream } = this
    let durationStream: Stream<unknown>

    try {
      durationStream = getDurationStream(value)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.value = value
    this.hasValue = true

    if (this.durationStreamSubscription) {
      this.durationStreamSubscription.dispose()
      this.durationStreamSubscription = null
    }

    this.subscribeStreamToSelf(durationStream)
  }

  protected onComplete(): void {
    this.distributeValue()
    this.destination.complete()
  }

  protected onOuterNextValue(): void {
    this.distributeValue()
  }

  protected onOuterComplete(): void {
    this.distributeValue()
  }

  private distributeValue(): void {
    if (!this.hasValue) {
      return
    }

    const value = this.value!

    if (this.durationStreamSubscription) {
      this.durationStreamSubscription.dispose()
      this.durationStreamSubscription = null
    }

    this.value = null
    this.hasValue = false

    this.destination.next(value)
  }
}
