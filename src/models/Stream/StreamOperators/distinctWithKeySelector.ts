import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { MonoTypeStreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
import { curry2 } from 'src/utils/curry'

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

class DistinctWithKeySelectorOperator<TValue, TKey>
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

class DistinctWithKeySelectorSubscriber<
  TValue,
  TKey
> extends MonoTypeStreamValueTransmitter<TValue> {
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
