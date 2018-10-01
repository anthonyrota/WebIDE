import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function distinctUntilChangedWithKeySelectorAndCompareFunction<
  TValue,
  TKey
>(
  selectKey: (value: TValue) => TKey,
  isEqual: (lastKey: TKey, newKey: TKey) => boolean
): Operation<TValue, TValue> {
  return operateThroughValueTransmitter(
    target =>
      new DistinctUntilChangedWithKeySelectorAndCompareFunctionValueTransmitter(
        target,
        selectKey,
        isEqual
      )
  )
}

class DistinctUntilChangedWithKeySelectorAndCompareFunctionValueTransmitter<
  TValue,
  TKey
> extends MonoTypeValueTransmitter<TValue> {
  private lastKey?: TKey
  private hasLastKey: boolean = false

  constructor(
    target: ISubscriptionTarget<TValue>,
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
