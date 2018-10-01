import {
  DoubleInputValueTransmitterWithData,
  DoubleInputValueTransmitterWithDataSubscriptionTarget
} from 'src/models/Stream/DoubleInputValueTransmitterWithData'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function delayWhen<T>(
  getDelayDurationStream: (value: T, index: number) => Stream<unknown>
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new DelayWhenValueTransmitter(target, getDelayDurationStream)
  )
}

class DelayWhenValueTransmitter<T> extends DoubleInputValueTransmitterWithData<
  T,
  T,
  unknown,
  T
> {
  private delayedValuesCount: number = 0
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<T>,
    private getDelayDurationStream: (value: T, index: number) => Stream<unknown>
  ) {
    super(target)
  }

  protected onOuterNextValue(
    value: unknown,
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<unknown, T>
  ) {
    target.dispose()
    this.distributeDelayedValue(target.getData())
  }

  protected onOuterComplete(
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<unknown, T>
  ) {
    this.distributeDelayedValue(target.getData())
  }

  protected onNextValue(value: T): void {
    const { getDelayDurationStream } = this
    const index = this.index++
    let delayDurationStream: Stream<unknown>

    try {
      delayDurationStream = getDelayDurationStream(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.delayedValuesCount += 1
    this.subscribeStreamToSelf(delayDurationStream, value)
  }

  protected onComplete(): void {
    if (!this.isReceivingValues() && this.delayedValuesCount === 0) {
      this.destination.complete()
    }
  }

  private distributeDelayedValue(value: T): void {
    this.delayedValuesCount -= 1
    this.destination.next(value)

    if (!this.isReceivingValues() && this.delayedValuesCount === 0) {
      this.destination.complete()
    }
  }
}
