import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function distinctUntilChangedWithCompareFunction<T>(
  isEqual: (lastValue: T, newValue: T) => boolean
): IConnectOperator<T, T> {
  return new DistinctUntilChangedWithCompareFunctionOperator<T>(isEqual)
}

class DistinctUntilChangedWithCompareFunctionOperator<T>
  implements IConnectOperator<T, T> {
  constructor(private isEqual: (lastValue: T, newValue: T) => boolean) {}

  public connect(
    target: MonoTypeValueTransmitter<T>,
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

class DistinctUntilChangedWithCompareFunctionSubscriber<
  T
> extends MonoTypeValueTransmitter<T> {
  private lastValue?: T
  private hasLastValue: boolean = false

  constructor(
    target: ISubscriber<T>,
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

    let isValuesEqual: boolean

    try {
      isValuesEqual = isEqual(this.lastValue!, value)
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (isValuesEqual) {
      this.lastValue = value
      this.destination.next(value)
    }
  }
}
