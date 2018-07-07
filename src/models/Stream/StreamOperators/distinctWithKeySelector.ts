import { Stream } from 'src/models/Stream/Stream'
import { curry2 } from 'src/utils/curry'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { IOperator } from 'src/models/Stream/IOperator'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLIke'
import { MonoTypeStreamDistributor } from 'src/models/Stream/StreamDistributor'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'

export const distinctWithKeySelector: {
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
      new DistinctWithKeySelectorOperator<TValue, TKey>(selectKey)
    )
  }
)

export class DistinctWithKeySelectorOperator<TValue, TKey>
  implements IOperator<TValue, TValue> {
  constructor(private selectKey: (value: TValue) => TKey) {}

  public call(
    target: StreamSubscriptionTarget<TValue>,
    source: Stream<TValue>
  ): IDisposableLike {
    return source.subscribe(
      new DistinctWithKeySelectorSubscriber<TValue, TKey>(
        target,
        this.selectKey
      )
    )
  }
}

export class DistinctWithKeySelectorSubscriber<
  TValue,
  TKey
> extends MonoTypeStreamDistributor<TValue> {
  private keys = new Set<TKey>()

  constructor(
    target: IStreamSubscriber<TValue>,
    private selectKey: (value: TValue) => TKey
  ) {
    super(target)
  }

  protected onNextValue(value: TValue): void {
    const { selectKey, keys, destination } = this
    let key: TKey

    try {
      key = selectKey(value)
    } catch (error) {
      destination.error(error)
      return
    }

    if (!keys.has(key)) {
      keys.add(key)
      destination.next(value)
    }
  }
}
