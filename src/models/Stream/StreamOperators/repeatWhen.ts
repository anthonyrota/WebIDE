import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ISubscription } from 'src/models/Disposable/Subscription'
import { DistributedStream } from 'src/models/Stream/DistributedStream'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function repeatWhen<T>(
  getShouldRepeatStream: (completionsStream: Stream<void>) => Stream<void>
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
    return new RepeatWhenSubscriber<T>(
      target,
      this.getShouldRepeatStream,
      source
    )
  }
}

class RepeatWhenSubscriber<T> extends DoubleInputValueTransmitter<T, T, void> {
  private completionsStream: DistributedStream<void>
  private shouldRepeatStreamSubscription!: ISubscription
  private isSubscribedToSource: boolean = true

  constructor(
    target: ISubscriber<T>,
    getShouldRepeatStream: (completionsStream: Stream<void>) => Stream<void>,
    private source: Stream<T>
  ) {
    super(target)

    this.completionsStream = new DistributedStream<void>()
    this.add(this.completionsStream)

    let shouldRepeatStream: Stream<void>

    try {
      shouldRepeatStream = getShouldRepeatStream(this.completionsStream)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.source.subscribe(this)
    this.shouldRepeatStreamSubscription = this.subscribeStreamToSelf(
      shouldRepeatStream
    )
  }

  public disposeAndRecycle(): void {
    if (this.completionsStream) {
      this.remove(this.completionsStream)
    }
    if (this.shouldRepeatStreamSubscription) {
      this.remove(this.shouldRepeatStreamSubscription)
    }
    super.disposeAndRecycle()
    if (this.completionsStream) {
      this.add(this.completionsStream)
    }
    if (this.shouldRepeatStreamSubscription) {
      this.add(this.shouldRepeatStreamSubscription)
    }
  }

  public complete(): void {
    if (this.isReceivingValues()) {
      if (!this.shouldRepeatStreamSubscription.isActive()) {
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
