import { Subscription } from 'src/models/Disposable/Subscription'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export class DoubleInputValueTransmitterWithDataSubscriptionTarget<
  TOuterValue,
  TData
> extends Subscription implements IRequiredSubscriber<TOuterValue> {
  constructor(
    private __transmitter: DoubleInputValueTransmitterWithData<
      any,
      any,
      TOuterValue,
      TData
    >,
    private __data: TData
  ) {
    super()
  }

  public next(value: TOuterValue): void {
    this.__transmitter.outerNext(value, this)
  }

  public error(error: any): void {
    this.__transmitter.outerError(error, this)
    this.dispose()
  }

  public complete(): void {
    this.__transmitter.outerComplete(this)
    this.dispose()
  }

  public getData(): TData {
    return this.__data
  }
}

export abstract class DoubleInputValueTransmitterWithData<
  TInput,
  TOutput,
  TOuterValue,
  TData
> extends ValueTransmitter<TInput, TOutput> {
  public outerNext(
    value: TOuterValue,
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<
      TOuterValue,
      TData
    >
  ): void {
    if (this.isActive()) {
      this.onOuterNextValue(value, target)
    }
  }

  public outerError(
    error: any,
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<
      TOuterValue,
      TData
    >
  ): void {
    if (this.isActive()) {
      this.onOuterError(error, target)
    }
  }

  public outerComplete(
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<
      TOuterValue,
      TData
    >
  ): void {
    if (this.isActive()) {
      this.onOuterComplete(target)
    }
  }

  protected onOuterNextValue(
    value: TOuterValue,
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<
      TOuterValue,
      TData
    >
  ): void {}

  protected onOuterError(
    error: any,
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<
      TOuterValue,
      TData
    >
  ): void {
    this.error(error)
  }

  protected onOuterComplete(
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<
      TOuterValue,
      TData
    >
  ): void {
    this.complete()
  }

  protected subscribeStreamToSelf(
    stream: Stream<TOuterValue>,
    data: TData
  ): DoubleInputValueTransmitterWithDataSubscriptionTarget<TOuterValue, TData> {
    const target = new DoubleInputValueTransmitterWithDataSubscriptionTarget<
      TOuterValue,
      TData
    >(this, data)

    target.terminateDisposableWhenDisposed(stream.subscribe(target))
    this.terminateDisposableWhenDisposed(target)

    return target
  }
}

export class MonoTypeDoubleInputValueTransmitterWithData<
  TValue,
  TData
> extends DoubleInputValueTransmitterWithData<TValue, TValue, TValue, TData> {
  protected onNextValue(value: TValue): void {
    this.destination.next(value)
  }

  protected onOuterNextValue(value: TValue): void {
    this.next(value)
  }
}
