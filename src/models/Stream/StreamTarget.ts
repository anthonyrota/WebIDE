import { StreamDistributor } from 'src/models/Stream/StreamDistributor'

export class StreamTarget<T> {
  private __distributor: StreamDistributor<T>

  constructor(distributor: StreamDistributor<T>) {
    this.__distributor = distributor
  }

  public next(value: T): void {
    this.__distributor.onNextValue(value)
  }

  public error(error: any): void {
    this.__distributor.onError(error)
  }

  public complete(): void {
    this.__distributor.onComplete()
  }
}
