import { DoubleInputValueTransmitter } from '../DoubleInputValueTransmitter'
import { ISubscriptionTarget } from '../ISubscriptionTarget'
import { operateThroughValueTransmitter, Operation } from '../Operation'
import { Stream } from '../Stream'

export function isSequenceEqualWithCompareFunction<T, U>(
  compareTo: Stream<U>,
  isEqual: (a: T, b: U) => boolean
): Operation<T, boolean> {
  return operateThroughValueTransmitter(
    target =>
      new IsSequenceEqualWithCompareFunctionValueTransmitter(
        target,
        compareTo,
        isEqual
      )
  )
}

class IsSequenceEqualWithCompareFunctionValueTransmitter<
  T,
  U
> extends DoubleInputValueTransmitter<T, boolean, U> {
  private firstStreamValues: T[] = []
  private secondStreamValues: U[] = []
  private isOneStreamCompleted: boolean = false

  constructor(
    target: ISubscriptionTarget<boolean>,
    compareTo: Stream<U>,
    private isEqual: (a: T, b: U) => boolean
  ) {
    super(target)
    this.subscribeStreamToSelf(compareTo)
  }

  protected onNextValue(value: T): void {
    if (this.isOneStreamCompleted && this.secondStreamValues.length === 0) {
      this.destination.next(false)
      this.destination.complete()
    } else {
      this.firstStreamValues.push(value)
      this.checkValues()
    }
  }

  protected onComplete(): void {
    if (this.isOneStreamCompleted) {
      this.destination.next(
        this.firstStreamValues.length === 0 &&
          this.secondStreamValues.length === 0
      )
      this.destination.complete()
    } else if (this.secondStreamValues.length > 0) {
      this.destination.next(false)
      this.destination.complete()
    } else {
      this.isOneStreamCompleted = true
    }
  }

  protected onOuterNextValue(value: U): void {
    if (this.isOneStreamCompleted && this.firstStreamValues.length === 0) {
      this.destination.next(false)
      this.destination.complete()
    } else {
      this.secondStreamValues.push(value)
      this.checkValues()
    }
  }

  protected onOuterComplete(): void {
    if (this.isOneStreamCompleted) {
      this.destination.next(
        this.firstStreamValues.length === 0 &&
          this.secondStreamValues.length === 0
      )
      this.destination.complete()
    } else if (this.firstStreamValues.length > 0) {
      this.destination.next(false)
      this.destination.complete()
    } else {
      this.isOneStreamCompleted = true
    }
  }

  private checkValues(): void {
    while (
      this.firstStreamValues.length > 0 &&
      this.secondStreamValues.length > 0
    ) {
      const { isEqual } = this
      const first = this.firstStreamValues.shift()!
      const second = this.secondStreamValues.shift()!
      let isValuesEqual: boolean

      try {
        isValuesEqual = isEqual(first, second)
      } catch (error) {
        this.destination.error(error)
        return
      }

      if (!isValuesEqual) {
        this.destination.next(false)
        this.destination.complete()
      }
    }
  }
}
