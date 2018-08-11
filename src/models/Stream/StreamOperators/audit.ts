import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function audit<T>(
  getShouldClearThrottleStream: (value: T) => Stream<unknown>
): IOperator<T, T> {
  return new AuditOperator(getShouldClearThrottleStream)
}

class AuditOperator<T> implements IOperator<T, T> {
  constructor(
    private getShouldClearThrottleStream: (value: T) => Stream<unknown>
  ) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new AuditSubscriber<T>(target, this.getShouldClearThrottleStream)
    )
  }
}

class AuditSubscriber<T> extends DoubleInputValueTransmitter<T, T, unknown> {
  private value: T | null = null
  private hasValue: boolean = false
  private shouldClearThrottleStreamSubscription: IDisposable | null = null

  constructor(
    target: ISubscriber<T>,
    private getShouldClearThrottleStream: (value: T) => Stream<unknown>
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.value = value
    this.hasValue = true

    if (!this.shouldClearThrottleStreamSubscription) {
      const { getShouldClearThrottleStream } = this
      let shouldClearThrottleStream: Stream<unknown>

      try {
        shouldClearThrottleStream = getShouldClearThrottleStream(value)
      } catch (error) {
        this.destination.error(error)
        return
      }

      this.shouldClearThrottleStreamSubscription = this.subscribeStreamToSelf(
        shouldClearThrottleStream
      )
    }
  }

  protected onOuterNextValue(): void {
    this.clearThrottle()
  }

  protected onOuterComplete(): void {
    this.clearThrottle()
  }

  private clearThrottle(): void {
    if (this.shouldClearThrottleStreamSubscription) {
      this.shouldClearThrottleStreamSubscription.dispose()
    }

    if (this.hasValue) {
      const value = this.value!

      this.value = null
      this.hasValue = false
      this.destination.next(value)
    }
  }
}
