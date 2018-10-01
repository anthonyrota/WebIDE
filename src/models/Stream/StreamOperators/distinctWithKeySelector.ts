import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function distinctWithKeySelector<TValue, TKey>(
  selectKey: (value: TValue) => TKey
): Operation<TValue, TValue> {
  return operateThroughValueTransmitter(
    target => new DistinctWithKeySelectorValueTransmitter(target, selectKey)
  )
}

class DistinctWithKeySelectorValueTransmitter<
  TValue,
  TKey
> extends MonoTypeValueTransmitter<TValue> {
  private keys = new Set<TKey>()

  constructor(
    target: ISubscriptionTarget<TValue>,
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
