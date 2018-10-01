import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { operate, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function sample<T>(
  shouldEmitValueStream: Stream<unknown>
): Operation<T, T> {
  return operate(
    (source, target) =>
      new SampleSubscriber(target, shouldEmitValueStream, source)
  )
}

class SampleSubscriber<T> extends DoubleInputValueTransmitter<T, T, unknown> {
  private mutableLatestValue: MutableMaybe<T> = MutableMaybe.none()

  constructor(
    target: ISubscriptionTarget<T>,
    shouldEmitValueStream: Stream<unknown>,
    source: Stream<T>
  ) {
    super(target)

    source.subscribe(this)
    this.subscribeStreamToSelf(shouldEmitValueStream)
  }

  protected onNextValue(value: T): void {
    this.mutableLatestValue.setAs(value)
  }

  protected onOuterNextValue(): void {
    this.emitValue()
  }

  protected onOuterComplete(): void {
    this.emitValue()
  }

  private emitValue(): void {
    this.mutableLatestValue.withValue(latestValue => {
      this.mutableLatestValue.empty()
      this.destination.next(latestValue)
    })
  }
}
