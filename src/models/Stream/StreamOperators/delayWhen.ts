import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import {
  DoubleInputValueTransmitterWithData,
  DoubleInputValueTransmitterWithDataSubscriptionTarget
} from 'src/models/Stream/DoubleInputValueTransmitterWithData'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function delayWhen<T>(
  getDelayDurationStream: (value: T, index: number) => Stream<unknown>
): IOperator<T, T> {
  return new DelayWhenOperator<T>(getDelayDurationStream)
}

class DelayWhenOperator<T> implements IOperator<T, T> {
  constructor(
    private getDelayDurationStream: (value: T, index: number) => Stream<unknown>
  ) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new DelayWhenSubscriber<T>(target, this.getDelayDurationStream)
    )
  }
}

class DelayWhenSubscriber<T> extends DoubleInputValueTransmitterWithData<
  T,
  T,
  unknown,
  T
> {
  private delayedValuesCount: number = 0
  private index: number = 0

  constructor(
    target: ISubscriber<T>,
    private getDelayDurationStream: (value: T, index: number) => Stream<unknown>
  ) {
    super(target)
  }

  protected onOuterComplete(
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<unknown, T>
  ) {
    this.delayedValuesCount -= 1
    this.destination.next(target.getData())

    if (!this.isReceivingValues() && this.delayedValuesCount === 0) {
      this.destination.complete()
    }
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
}
