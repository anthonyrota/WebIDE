import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { operate, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function retryAlways<T>(): Operation<T, T> {
  return operate((source, target) =>
    source.subscribe(new RetryValueTransmitter(target, source))
  )
}

class RetryValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriptionTarget<T>, private source: Stream<T>) {
    super(target)
  }

  public error(): void {
    if (this.isActive()) {
      this.disposeAndRecycle()
      this.source.subscribe(this)
    }
  }
}
