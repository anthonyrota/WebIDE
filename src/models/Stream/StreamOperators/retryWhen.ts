import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ISubscription } from 'src/models/Disposable/Subscription'
import { DistributedStream } from 'src/models/Stream/DistributedStream'
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
    return source.subscribe(
      new RetryWhenSubscriber(target, this.getShouldRetryStream, source)
    )
  }
}

class RetryWhenSubscriber<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private errorStream: DistributedStream<unknown> | null = null
  private shouldRetryStreamSubscription: ISubscription | null = null

  constructor(
    target: ISubscriber<T>,
    private getShouldRetryStream: (
      errorStream: Stream<unknown>
    ) => Stream<unknown>,
    private source: Stream<T>
  ) {
    super(target)
  }

  public disposeAndRecycle(): void {
    if (this.errorStream) {
      this.removeSubscription(this.errorStream)
    }
    if (this.shouldRetryStreamSubscription) {
      this.removeSubscription(this.shouldRetryStreamSubscription)
    }
    super.disposeAndRecycle()
    if (this.errorStream) {
      this.terminateDisposableWhenDisposed(this.errorStream)
    }
    if (this.shouldRetryStreamSubscription) {
      this.terminateDisposableWhenDisposed(this.shouldRetryStreamSubscription)
    }
  }

  public error(error: unknown): void {
    if (this.isReceivingValues()) {
      if (!this.errorStream) {
        this.errorStream = new DistributedStream<unknown>()

        let shouldRetryStream: Stream<unknown>
        const { getShouldRetryStream } = this

        try {
          shouldRetryStream = getShouldRetryStream(this.errorStream)
        } catch (error) {
          this.destination.error(error)
          return
        }

        this.shouldRetryStreamSubscription = this.subscribeStreamToSelf(
          shouldRetryStream
        )
      }

      this.disposeAndRecycle()
      this.errorStream.next(error)
    }
  }

  protected onOuterNextValue(): void {
    this.disposeAndRecycle()
    this.source.subscribe(this)
  }
}
