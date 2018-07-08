import { MonoTypeStreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'

export class StreamSubscriptionTarget<T> {
  private __transmitter: MonoTypeStreamValueTransmitter<T>

  constructor(transmitter: MonoTypeStreamValueTransmitter<T>) {
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
