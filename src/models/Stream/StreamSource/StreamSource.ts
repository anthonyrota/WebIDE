import { bind } from 'src/decorators/bind'
import { StreamDistributor } from 'src/models/Stream/StreamDistributor/StreamDistributor'

export class StreamSource<T> {
  private __distributor: StreamDistributor<T>

  constructor(distributor: StreamDistributor<T>) {
    this.__distributor = distributor
  }

  @bind
  public next(value: T) {
    this.__distributor.onNextValue(value)
  }

  @bind
  public error(error: any) {
    this.__distributor.onError(error)
  }

  @bind
  public complete() {
    this.__distributor.onComplete()
  }
}

export function isStreamSource(value: any): value is StreamSource<any> {
  return value instanceof StreamSource
}
