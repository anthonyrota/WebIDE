import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
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
    target: SubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new FinalizeSubscriber<T>(target, this.onDispose))
  }
}

class FinalizeSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, onDispose: () => any) {
    super(target)
    super.onDispose(onDispose)
  }
}
