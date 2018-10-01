import { ISubscription } from 'src/models/Disposable/Subscription'
import { ControlledStream } from 'src/models/Stream/ControlledStream'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { operate, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function retryWhen<T>(
  getShouldRetryStream: (errorStream: Stream<unknown>) => Stream<unknown>
): Operation<T, T> {
  return operate(
    (source, target) =>
      new RetryWhenValueTransmitter(target, getShouldRetryStream, source)
  )
}

class RetryWhenValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private errorStream: ControlledStream<unknown>
  private shouldRetryStreamSubscription!: ISubscription
  private isSubscribedToSource: boolean = true

  constructor(
    target: ISubscriptionTarget<T>,
    getShouldRetryStream: (errorStream: Stream<unknown>) => Stream<unknown>,
    private source: Stream<T>
  ) {
    super(target)

    this.errorStream = new ControlledStream<unknown>()
    this.addOnDispose(this.errorStream)

    let shouldRetryStream: Stream<unknown>

    try {
      shouldRetryStream = getShouldRetryStream(this.errorStream)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.source.subscribe(this)
    this.shouldRetryStreamSubscription = this.subscribeStreamToSelf(
      shouldRetryStream
    )
  }

  public disposeAndRecycle(): void {
    if (this.errorStream) {
      this.removeOnDispose(this.errorStream)
    }
    if (this.shouldRetryStreamSubscription) {
      this.removeOnDispose(this.shouldRetryStreamSubscription)
    }
    super.disposeAndRecycle()
    if (this.errorStream) {
      this.addOnDispose(this.errorStream)
    }
    if (this.shouldRetryStreamSubscription) {
      this.addOnDispose(this.shouldRetryStreamSubscription)
    }
  }

  public error(error: unknown): void {
    if (this.isReceivingValues()) {
      if (!this.shouldRetryStreamSubscription.isActive()) {
        this.destination.error(error)
        return
      }
      this.isSubscribedToSource = false
      this.disposeAndRecycle()
      this.errorStream.next(error)
    }
  }

  protected onComplete(): void {
    this.errorStream.complete()
    this.destination.complete()
  }

  protected onOuterNextValue(): void {
    this.resubscribeToSource()
  }

  protected onOuterComplete(): void {
    if (!this.isSubscribedToSource) {
      this.destination.complete()
    }
  }

  private resubscribeToSource(): void {
    this.isSubscribedToSource = true
    this.disposeAndRecycle()
    this.source.subscribe(this)
  }
}
