import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { IOperator } from 'src/models/Stream/IOperator'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLIke'
import { MonoTypeStreamDistributor } from 'src/models/Stream/StreamDistributor'
import { curry3 } from 'src/utils/curry'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'

export const distinctUntilChangedWithKeySelectorAndCompareFunction: {
  <TValue, TKey>(selectKey: (value: TValue) => TKey): (
    isEqual: (lastKey: TKey, newKey: TKey) => boolean
  ) => (source: Stream<TValue>) => Stream<TValue>
  <TValue, TKey>(
    selectKey: (value: TValue) => TKey,
    isEqual: (lastKey: TKey, newKey: TKey) => boolean
  ): (source: Stream<TValue>) => Stream<TValue>
  <TValue, TKey>(
    selectKey: (value: TValue) => TKey,
    isEqual: (lastKey: TKey, newKey: TKey) => boolean,
    source: Stream<TValue>
  ): Stream<TValue>
} = curry3(
  <TValue, TKey>(
    selectKey: (value: TValue) => TKey,
    isEqual: (lastKey: TKey, newKey: TKey) => boolean,
    source: Stream<TValue>
  ): Stream<TValue> => {
    return source.lift(
      new DistinctUntilChangedWithKeySelectorAndCompareFunctionOperator<
        TValue,
        TKey
      >(selectKey, isEqual)
    )
  }
)

export class DistinctUntilChangedWithKeySelectorAndCompareFunctionOperator<
  TValue,
  TKey
> implements IOperator<TValue, TValue> {
  constructor(
    private selectKey: (value: TValue) => TKey,
    private isEqual: (lastKey: TKey, newKey: TKey) => boolean
  ) {}

  public call(
    target: StreamSubscriptionTarget<TValue>,
    source: Stream<TValue>
  ): IDisposableLike {
    return source.subscribe(
      new DistinctUntilChangedWithKeySelectorAndCompareFunctionSubscriber<
        TValue,
        TKey
      >(target, this.selectKey, this.isEqual)
    )
  }
}

export class DistinctUntilChangedWithKeySelectorAndCompareFunctionSubscriber<
  TValue,
  TKey
> extends MonoTypeStreamDistributor<TValue> {
  private lastKey?: TKey
  private hasLastKey: boolean = false

  constructor(
    target: IStreamSubscriber<TValue>,
    private selectKey: (value: TValue) => TKey,
    private isEqual: (lastKey: TKey, newKey: TKey) => boolean
  ) {
    super(target)
  }

  protected onNextValue(value: TValue): void {
    const { selectKey, isEqual } = this

    let key: TKey

    try {
      key = selectKey(value)
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (!this.hasLastKey) {
      this.hasLastKey = true
      this.lastKey = key
      this.destination.next(value)
      return
    }

    if (isEqual(this.lastKey!, key)) {
      this.lastKey = key
      this.destination.next(value)
    }
  }
}
