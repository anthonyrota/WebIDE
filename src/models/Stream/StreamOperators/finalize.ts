import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { MonoTypeStreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const finalize: {
  <T>(onDispose: () => any): (source: Stream<T>) => Stream<T>
  <T>(onDispose: () => any, source: Stream<T>): Stream<T>
} = curry2(
  <T>(onDispose: () => any, source: Stream<T>): Stream<T> => {
    return source.lift(new FinalizeOperator<T>(onDispose))
  }
)

class FinalizeOperator<T> implements IOperator<T, T> {
  constructor(private onDispose: () => any) {}

  public call(
    target: StreamSubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new FinalizeSubscriber<T>(target, this.onDispose))
  }
}

class FinalizeSubscriber<T> extends MonoTypeStreamValueTransmitter<T> {
  constructor(target: IStreamSubscriber<T>, onDispose: () => any) {
    super(target)
    super.onDispose(onDispose)
  }
}
