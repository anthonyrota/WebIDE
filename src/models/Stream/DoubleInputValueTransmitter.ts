import { Subscription } from 'src/models/Disposable/Subscription'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export class DoubleInputValueTransmitterSubscriptionTarget<TOuterValue>
  extends Subscription
  implements IRequiredSubscriber<TOuterValue> {
  constructor(
    private __transmitter: DoubleInputValueTransmitter<any, any, TOuterValue>
  ) {
    super()
  }

  public next(value: TOuterValue): void {
    this.__transmitter.outerNext(value, this)
  }

  public error(error: any): void {
    this.__transmitter.outerError(error)
    this.dispose()
  }

  public complete(): void {
    this.__transmitter.outerComplete()
    this.dispose()
  }
}

export abstract class DoubleInputValueTransmitter<
  TInput,
  TOutput,
  TOuterValue
> extends ValueTransmitter<TInput, TOutput> {
  public outerNext(
    value: TOuterValue,
    target: DoubleInputValueTransmitterSubscriptionTarget<TOuterValue>
  ): void {
    if (this.isActive()) {
      this.onOuterNextValue(value, target)
    }
  }

  public outerError(error: any): void {
    if (this.isActive()) {
      this.onOuterError(error)
    }
  }

  public outerComplete(): void {
    if (this.isActive()) {
      this.onOuterComplete()
    }
  }

  protected onOuterNextValue(
    value: TOuterValue,
    target: DoubleInputValueTransmitterSubscriptionTarget<TOuterValue>
  ): void {}

  protected onOuterError(error: any): void {
    this.error(error)
  }

  protected onOuterComplete(): void {
    this.complete()
  }

  protected subscribeStreamToSelf(
    stream: Stream<TOuterValue>
  ): DoubleInputValueTransmitterSubscriptionTarget<TOuterValue> {
    const target = new DoubleInputValueTransmitterSubscriptionTarget<
      TOuterValue
    >(this)

    target.terminateDisposableWhenDisposed(stream.subscribe(target))
    this.terminateDisposableWhenDisposed(target)

    return target
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
