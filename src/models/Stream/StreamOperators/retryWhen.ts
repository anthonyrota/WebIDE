import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ISubscription } from 'src/models/Disposable/Subscription'
import { ControlledStream } from 'src/models/Stream/ControlledStream'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function retryWhen<T>(
  getShouldRetryStream: (errorStream: Stream<unknown>) => Stream<unknown>
): IOperator<T, T> {
  return new RetryWhenOperator<T>(getShouldRetryStream)
}

class RetryWhenOperator<T> implements IOperator<T, T> {
  constructor(
    private getShouldRetryStream: (
      errorStream: Stream<unknown>
    ) => Stream<unknown>
  ) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return new RetryWhenSubscriber(target, this.getShouldRetryStream, source)
  }
}

class RetryWhenSubscriber<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private errorStream: ControlledStream<unknown>
  private shouldRetryStreamSubscription!: ISubscription
  private isSubscribedToSource: boolean = true

  constructor(
    target: ISubscriber<T>,
    getShouldRetryStream: (errorStream: Stream<unknown>) => Stream<unknown>,
    private source: Stream<T>
  ) {
    super(target)

    this.errorStream = new ControlledStream<unknown>()
    this.add(this.errorStream)

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
      this.remove(this.errorStream)
    }
    if (this.shouldRetryStreamSubscription) {
      this.remove(this.shouldRetryStreamSubscription)
    }
    super.disposeAndRecycle()
    if (this.errorStream) {
      this.add(this.errorStream)
    }
    if (this.shouldRetryStreamSubscription) {
      this.add(this.shouldRetryStreamSubscription)
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
