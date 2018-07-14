import { Subscription } from 'src/models/Disposable/Subscription'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export class DoubleInputValueTransmitterSubscriptionTarget<T>
  extends Subscription
  implements IRequiredSubscriber<T> {
  private __transmitter: DoubleInputValueTransmitter<any, any, T>

  constructor(transmitter: DoubleInputValueTransmitter<any, any, T>) {
    super()

    this.__transmitter = transmitter
  }

  public next(value: T): void {
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

  protected subscribeStreamToSelf(
    stream: Stream<TOuterValue>
  ): DoubleInputValueTransmitterSubscriptionTarget<TOuterValue> {
    const target = new DoubleInputValueTransmitterSubscriptionTarget(this)

    target.terminateDisposableWhenDisposed(stream.subscribe(target))
    this.terminateDisposableWhenDisposed(target)

    return target
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
}

export abstract class DoubleInputValueTransmitterWithSameInputAndOuterTypes<
  TInput,
  TOutput
> extends DoubleInputValueTransmitter<TInput, TOutput, TInput> {
  protected onOuterNextValue(value: TInput): void {
    this.next(value)
  }
}

export abstract class DoubleInputValueTransmitterWithSameOutputAndOuterTypes<
  TInput,
  TOutput
> extends DoubleInputValueTransmitter<TInput, TOutput, TOutput> {
  protected onOuterNextValue(value: TOutput): void {
    this.destination.next(value)
  }
}

export class DoubleInputValueTransmitterWithSameInputAndOutputTypes<
  TInput,
  TOutput
> extends DoubleInputValueTransmitter<TInput, TInput, TOutput> {
  protected onNextValue(value: TInput): void {
    this.destination.next(value)
  }
}

export class MonoTypeDoubleInputValueTransmitter<
  T
> extends DoubleInputValueTransmitter<T, T, T> {
  protected onNextValue(value: T): void {
    this.destination.next(value)
  }

  protected onOuterNextValue(value: T): void {
    this.next(value)
  }
}
