import { ISubscription } from 'src/models/Disposable/Subscription'
import { ControlledStream } from 'src/models/Stream/ControlledStream'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { operate, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function repeatWhen<T>(
  getShouldRepeatStream: (completionsStream: Stream<void>) => Stream<void>
): Operation<T, T> {
  return operate(
    (source, target) =>
      new RepeatWhenValueTransmitter(target, getShouldRepeatStream, source)
  )
}

class RepeatWhenValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  T,
  void
> {
  private completionsStream: ControlledStream<void>
  private shouldRepeatStreamSubscription!: ISubscription
  private isSubscribedToSource: boolean = true

  constructor(
    target: ISubscriptionTarget<T>,
    getShouldRepeatStream: (completionsStream: Stream<void>) => Stream<void>,
    private source: Stream<T>
  ) {
    super(target)

    this.completionsStream = new ControlledStream<void>()
    this.addOnDispose(this.completionsStream)

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
      this.removeOnDispose(this.completionsStream)
    }
    if (this.shouldRepeatStreamSubscription) {
      this.removeOnDispose(this.shouldRepeatStreamSubscription)
    }
    super.disposeAndRecycle()
    if (this.completionsStream) {
      this.addOnDispose(this.completionsStream)
    }
    if (this.shouldRepeatStreamSubscription) {
      this.addOnDispose(this.shouldRepeatStreamSubscription)
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
