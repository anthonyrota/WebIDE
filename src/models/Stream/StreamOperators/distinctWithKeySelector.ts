import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function distinctWithKeySelector<TValue, TKey>(
  selectKey: (value: TValue) => TKey
): IOperator<TValue, TValue> {
  return new DistinctWithKeySelectorOperator<TValue, TKey>(selectKey)
}

class DistinctWithKeySelectorOperator<TValue, TKey>
  implements IOperator<TValue, TValue> {
  constructor(private selectKey: (value: TValue) => TKey) {}

  public connect(
    target: ISubscriber<TValue>,
    source: Stream<TValue>
  ): DisposableLike {
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
> extends MonoTypeValueTransmitter<TValue> {
  private keys = new Set<TKey>()

  constructor(
    target: ISubscriber<TValue>,
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
