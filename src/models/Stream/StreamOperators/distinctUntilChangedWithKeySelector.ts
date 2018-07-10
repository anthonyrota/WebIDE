import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { curry2 } from 'src/utils/curry'

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

class DistinctUntilChangedWithKeySelectorOperator<TValue, TKey>
  implements IOperator<TValue, TValue> {
  constructor(private selectKey: (value: TValue) => TKey) {}

  public call(
    target: SubscriptionTarget<TValue>,
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

class DistinctUntilChangedWithKeySelectorSubscriber<
  TValue,
  TKey
> extends MonoTypeValueTransmitter<TValue> {
  private lastKey?: TKey
  private hasLastKey: boolean = false

  constructor(
    target: ISubscriber<TValue>,
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
