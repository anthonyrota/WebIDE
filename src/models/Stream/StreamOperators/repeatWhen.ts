import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ISubscription } from 'src/models/Disposable/Subscription'
import { DistributedStream } from 'src/models/Stream/DistributedStream'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function repeatWhen<T>(
  getShouldRepeatStream: (competionsStream: Stream<void>) => Stream<void>
): IOperator<T, T> {
  return new RepeatWhenOperator<T>(getShouldRepeatStream)
}

class RepeatWhenOperator<T> implements IOperator<T, T> {
  constructor(
    private getShouldRepeatStream: (
      completionsStream: Stream<void>
    ) => Stream<void>
  ) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new RepeatWhenSubscriber<T>(target, this.getShouldRepeatStream, source)
    )
  }
}

class RepeatWhenSubscriber<T> extends DoubleInputValueTransmitter<T, T, void> {
  private completionsStream: DistributedStream<void>
  private shouldRepeatStreamSubscription!: ISubscription
  private isSubscribedToSource: boolean = false

  constructor(
    target: ISubscriber<T>,
    getShouldRepeatStream: (errorStream: Stream<void>) => Stream<void>,
    private source: Stream<T>
  ) {
    super(target)

    this.completionsStream = new DistributedStream<void>()
    this.terminateDisposableWhenDisposed(this.completionsStream)

    let shouldRepeatStream: Stream<void>

    try {
      shouldRepeatStream = getShouldRepeatStream(this.completionsStream)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.resubscribeToSource()

    this.shouldRepeatStreamSubscription = this.subscribeStreamToSelf(
      shouldRepeatStream
    )
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

  public complete(): void {
    if (this.isReceivingValues()) {
      if (this.shouldRepeatStreamSubscription.isDisposed()) {
        this.destination.complete()
        return
      }
      this.isSubscribedToSource = false
      this.disposeAndRecycle()
      this.completionsStream.next(undefined)
    }
  }

  protected onComplete(): void {
    this.completionsStream.complete()
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
