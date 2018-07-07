import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { IOperator } from 'src/models/Stream/IOperator'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLIke'
import { MonoTypeStreamDistributor } from 'src/models/Stream/StreamDistributor'
import { curry2 } from 'src/utils/curry'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'

export const distinctUntilChangedWithCompareFunction: {
  <T>(isEqual: (lastValue: T, newValue: T) => boolean): (
    source: Stream<T>
  ) => Stream<T>
  <T>(
    isEqual: (lastValue: T, newValue: T) => boolean,
    source: Stream<T>
  ): Stream<T>
} = curry2(
  <T>(
    isEqual: (lastValue: T, newValue: T) => boolean,
    source: Stream<T>
  ): Stream<T> => {
    return source.lift(
      new DistinctUntilChangedWithCompareFunctionOperator<T>(isEqual)
    )
  }
)

export class DistinctUntilChangedWithCompareFunctionOperator<T>
  implements IOperator<T, T> {
  constructor(private isEqual: (lastValue: T, newValue: T) => boolean) {}

  public call(
    target: StreamSubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new DistinctUntilChangedWithCompareFunctionSubscriber<T>(
        target,
        this.isEqual
      )
    )
  }
}

export class DistinctUntilChangedWithCompareFunctionSubscriber<
  T
> extends MonoTypeStreamDistributor<T> {
  private lastValue?: T
  private hasLastValue: boolean = false

  constructor(
    target: IStreamSubscriber<T>,
    private isEqual: (lastValue: T, newValue: T) => boolean
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { isEqual } = this

    if (!this.hasLastValue) {
      this.hasLastValue = true
      this.lastValue = value
      this.destination.next(value)
      return
    }

    if (isEqual(this.lastValue!, value)) {
      this.lastValue = value
      this.destination.next(value)
    }
  }
}