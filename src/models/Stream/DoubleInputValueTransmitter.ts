import { Subscription } from 'src/models/Disposable/Subscription'
import { IRequiredSubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

interface IOuterSubscriptionTarget<TOuterValue> {
  outerNext(
    value: TOuterValue,
    target: DoubleInputValueTransmitterSubscriptionTarget<TOuterValue>
  ): void
  outerError(error: unknown): void
  outerComplete(): void
}

export class DoubleInputValueTransmitterSubscriptionTarget<TOuterValue>
  extends Subscription
  implements IRequiredSubscriptionTarget<TOuterValue> {
  constructor(private __transmitter: IOuterSubscriptionTarget<TOuterValue>) {
    super()
  }

  public next(value: TOuterValue): void {
    this.__transmitter.outerNext(value, this)
  }

  public error(error: unknown): void {
    this.__transmitter.outerError(error)
    this.dispose()
  }

  public complete(): void {
    this.__transmitter.outerComplete()
    this.dispose()
  }
}

export abstract class DoubleInputValueTransmitter<TInput, TOutput, TOuterValue>
  extends ValueTransmitter<TInput, TOutput>
  implements IOuterSubscriptionTarget<TOuterValue> {
  public outerNext(
    value: TOuterValue,
    target: DoubleInputValueTransmitterSubscriptionTarget<TOuterValue>
  ): void {
    if (this.isActive()) {
      this.onOuterNextValue(value, target)
    }
  }

  public outerError(error: unknown): void {
    if (this.isActive()) {
      this.onOuterError(error)
    }
  }

  public outerComplete(): void {
    if (this.isActive()) {
      this.onOuterComplete()
    }
  }

  public subscribeStreamToSelf(
    stream: Stream<TOuterValue>
  ): DoubleInputValueTransmitterSubscriptionTarget<TOuterValue> {
    const target = new DoubleInputValueTransmitterSubscriptionTarget<
      TOuterValue
    >(this)

    this.addOnDispose(target)
    stream.subscribe(target)

    return target
  }

  protected onOuterNextValue(
    value: TOuterValue,
    target: DoubleInputValueTransmitterSubscriptionTarget<TOuterValue>
  ): void {}

  protected onOuterError(error: unknown): void {
    this.error(error)
  }

  protected onOuterComplete(): void {
    this.complete()
  }
}

export class MonoTypeDoubleInputValueTransmitter<
  TValue
> extends DoubleInputValueTransmitter<TValue, TValue, TValue> {
  protected onNextValue(value: TValue): void {
    this.destination.next(value)
  }

  protected onOuterNextValue(value: TValue): void {
    this.destination.next(value)
  }
}
