import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { IOperator } from 'src/models/Stream/IOperator'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLIke'
import { MonoTypeStreamDistributor } from 'src/models/Stream/StreamDistributor'
import { curry2 } from 'src/utils/curry'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'

export const distinctUntilChangedWithKeySelector: {
  <TValue, TKey>(selectKey: (value: TValue) => TKey): (
    source: Stream<TValue>
  ) => Stream<TValue>
  <TValue, TKey>(
    selectKey: (value: TValue) => TKey,
    source: Stream<TValue>
  ): Stream<TValue>
} = curry2(
  <TValue, TKey>(
    selectKey: (value: TValue) => TKey,
    source: Stream<TValue>
  ): Stream<TValue> => {
    return source.lift(
      new DistinctUntilChangedWithKeySelectorOperator<TValue, TKey>(selectKey)
    )
  }
)

export class DistinctUntilChangedWithKeySelectorOperator<TValue, TKey>
  implements IOperator<TValue, TValue> {
  constructor(private selectKey: (value: TValue) => TKey) {}

  public call(
    target: StreamSubscriptionTarget<TValue>,
    source: Stream<TValue>
  ): IDisposableLike {
    return source.subscribe(
      new DistinctUntilChangedWithKeySelectorSubscriber<TValue, TKey>(
        target,
        this.selectKey
      )
    )
  }
}

export class DistinctUntilChangedWithKeySelectorSubscriber<
  TValue,
  TKey
> extends MonoTypeStreamDistributor<TValue> {
  private lastKey?: TKey
  private hasLastKey: boolean = false

  constructor(
    target: IStreamSubscriber<TValue>,
    private selectKey: (value: TValue) => TKey
  ) {
    super(target)
  }

  protected onNextValue(value: TValue): void {
    const { selectKey } = this

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

    if (this.lastKey !== key) {
      this.lastKey = key
      this.destination.next(value)
    }
  }
}
