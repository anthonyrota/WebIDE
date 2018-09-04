import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ISubscription } from 'src/models/Disposable/Subscription'
import { DistributedStream } from 'src/models/Stream/DistributedStream'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function repeatWhen<T>(
  getShouldRepeatStream: (competionsStream: Stream<void>) => Stream<unknown>
): IOperator<T, T> {
  return new RepeatWhenOperator<T>(getShouldRepeatStream)
}

class RepeatWhenOperator<T> implements IOperator<T, T> {
  constructor(
    private getShouldRepeatStream: (
      completionsStream: Stream<void>
    ) => Stream<unknown>
  ) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new RepeatWhenSubscriber<T>(target, this.getShouldRepeatStream, source)
    )
  }
}

class RepeatWhenSubscriber<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private completionsStream: DistributedStream<void> | null = null
  private shouldRepeatStreamSubscription: ISubscription | null = null
  private isCurrentlySubscribedToSource: boolean = true

  constructor(
    target: ISubscriber<T>,
    private getShouldRepeatStream: (
      completionsStream: Stream<void>
    ) => Stream<unknown>,
    private source: Stream<T>
  ) {
    super(target)
  }

  public onOuterNextValue(): void {
    this.isCurrentlySubscribedToSource = true
    this.source.subscribe(this)
  }

  public onOuterComplete(): void {
    if (!this.isCurrentlySubscribedToSource) {
      this.destination.complete()
    }
  }

  public complete(): void {
    if (this.isReceivingValues()) {
      this.isCurrentlySubscribedToSource = false

      if (!this.completionsStream) {
        this.completionsStream = new DistributedStream<void>()

        const { getShouldRepeatStream } = this
        let shouldRepeatStream: Stream<unknown>

        try {
          shouldRepeatStream = getShouldRepeatStream(this.completionsStream)
        } catch (error) {
          this.destination.error(error)
          return
        }

        this.shouldRepeatStreamSubscription = this.subscribeStreamToSelf(
          shouldRepeatStream
        )
      }

      if (
        !this.shouldRepeatStreamSubscription ||
        this.shouldRepeatStreamSubscription.isDisposed()
      ) {
        this.destination.complete()
        return
      }

      this.disposeAndRecycle()
      this.completionsStream.next(undefined)
    }
  }

  public disposeAndRecycle(): void {
    if (this.completionsStream) {
      this.removeSubscription(this.completionsStream)
    }
    if (this.shouldRepeatStreamSubscription) {
      this.removeSubscription(this.shouldRepeatStreamSubscription)
    }
    super.disposeAndRecycle()
    if (this.completionsStream) {
      this.terminateDisposableWhenDisposed(this.completionsStream)
    }
    if (this.shouldRepeatStreamSubscription) {
      this.terminateDisposableWhenDisposed(this.shouldRepeatStreamSubscription)
    }
  }
}
