import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { MonoTypeStreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const tapComplete: {
  <T>(tapWhenComplete: () => void): (source: Stream<T>) => Stream<T>
  <T>(tapWhenComplete: () => void, source: Stream<T>): Stream<T>
} = curry2(
  <T>(tapWhenComplete: () => void, source: Stream<T>): Stream<T> => {
    return source.lift(new TapCompleteOperator<T>(tapWhenComplete))
  }
)

class TapCompleteOperator<T> implements IOperator<T, T> {
  constructor(private tapWhenComplete: () => void) {}

  public call(
    target: StreamSubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new TapCompleteSubscriber<T>(target, this.tapWhenComplete)
    )
  }
}

class TapCompleteSubscriber<T> extends MonoTypeStreamValueTransmitter<T> {
  constructor(
    target: IStreamSubscriber<T>,
    private tapWhenComplete: () => void
  ) {
    super(target)
  }

  protected onComplete(): void {
    try {
      this.tapWhenComplete()
    } catch (error) {
      this.destination.error(error)
      return
    }
    this.destination.complete()
  }
}
