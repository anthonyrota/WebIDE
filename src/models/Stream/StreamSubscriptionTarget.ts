import { MonoTypeStreamDistributor } from 'src/models/Stream/StreamDistributor'

export class StreamSubscriptionTarget<T> {
  private __distributor: MonoTypeStreamDistributor<T>

  constructor(distributor: MonoTypeStreamDistributor<T>) {
    this.__distributor = distributor
  }

  public next(value: T): void {
    this.__distributor.next(value)
  }

  public error(error: any): void {
    this.__distributor.error(error)
  }

  public complete(): void {
    this.__distributor.complete()
  }
}
