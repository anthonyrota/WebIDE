import { Disposable } from 'src/models/Disposable/Disposable'
import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

class DoubleInputValueTransmitterSubscriptionTarget<T> extends Disposable
  implements IRequiredSubscriber<T> {
  private __transmitter: DoubleInputValueTransmitter<any, any, T>
  private __stream: Stream<T>
  private __streamSubscription: IConsciousDisposable
  private __connectionDisposable: IDisposable

  constructor(
    subscriber: DoubleInputValueTransmitter<any, any, T>,
    stream: Stream<T>
  ) {
    super()
    this.__transmitter = subscriber
    this.__stream = stream

    this.__streamSubscription = this.__stream.subscribe(this)
    this.__connectionDisposable = this.__transmitter.terminateDisposableWhenDisposed(
      this.__streamSubscription
    )
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

  protected _afterDisposed(): void {
    this.__streamSubscription.dispose()
    this.__connectionDisposable.dispose()
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
  ): IConsciousDisposable {
    return new DoubleInputValueTransmitterSubscriptionTarget(this, stream)
  }

  protected onOuterNextValue(
    value: TOuterValue,
    target: IConsciousDisposable
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
