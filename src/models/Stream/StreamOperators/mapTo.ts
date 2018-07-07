import { Stream } from 'src/models/Stream/Stream'
import { curry2 } from 'src/utils/curry'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLIke'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { IOperator } from 'src/models/Stream/IOperator'
import { StreamDistributor } from 'src/models/Stream/StreamDistributor'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'

export const mapTo: {
  <T>(value: T): (source: Stream<any>) => Stream<T>
  <T>(value: T, source: Stream<any>): Stream<T>
} = curry2(
  <T>(value: T, source: Stream<any>): Stream<T> => {
    return source.lift(new MapToOperator<T>(value))
  }
)

class MapToOperator<T> implements IOperator<any, T> {
  constructor(private value: T) {}

  public call(
    target: StreamSubscriptionTarget<T>,
    source: Stream<any>
  ): IDisposableLike {
    return source.subscribe(new MapToSubscriber<T>(target, this.value))
  }
}

class MapToSubscriber<T> extends StreamDistributor<any, T> {
  constructor(target: IStreamSubscriber<T>, private value: T) {
    super(target)
  }

  protected onNextValue(): void {
    this.destination.next(this.value)
  }
}
