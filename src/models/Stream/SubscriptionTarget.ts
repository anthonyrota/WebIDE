import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export class SubscriptionTarget<T> {
  private __transmitter: MonoTypeValueTransmitter<T>

  constructor(transmitter: MonoTypeValueTransmitter<T>) {
    this.__transmitter = transmitter
  }

  public next(value: T): void {
    this.__transmitter.next(value)
  }

  public error(error: any): void {
    this.__transmitter.error(error)
  }

  public complete(): void {
    this.__transmitter.complete()
  }
}
