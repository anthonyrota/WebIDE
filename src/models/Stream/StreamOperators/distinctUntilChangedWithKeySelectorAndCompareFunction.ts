import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function distinctUntilChangedWithKeySelectorAndCompareFunction<
  TValue,
  TKey
>(
  selectKey: (value: TValue) => TKey,
  isEqual: (lastKey: TKey, newKey: TKey) => boolean
): IOperator<TValue, TValue> {
  return new DistinctUntilChangedWithKeySelectorAndCompareFunctionOperator<
    TValue,
    TKey
  >(selectKey, isEqual)
}

class DistinctUntilChangedWithKeySelectorAndCompareFunctionOperator<
  TValue,
  TKey
> implements IOperator<TValue, TValue> {
  constructor(
    private selectKey: (value: TValue) => TKey,
    private isEqual: (lastKey: TKey, newKey: TKey) => boolean
  ) {}

  public call(
    target: MonoTypeValueTransmitter<TValue>,
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

class DistinctUntilChangedWithKeySelectorAndCompareFunctionSubscriber<
  TValue,
  TKey
> extends MonoTypeValueTransmitter<TValue> {
  private lastKey?: TKey
  private hasLastKey: boolean = false

  constructor(
    target: ISubscriber<TValue>,
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

    let isKeysEqual: boolean

    try {
      isKeysEqual = isEqual(this.lastKey!, key)
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (isKeysEqual) {
      this.lastKey = key
      this.destination.next(value)
    }
  }
}
