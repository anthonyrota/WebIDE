import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { operate, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function retry<T>(count: number): Operation<T, T> {
  if (count < 0) {
    throw new TypeError('count must be positive')
  }
  return operate((source, target) =>
    source.subscribe(new RetrySubscriber(target, count, source))
  )
}

class RetrySubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(
    target: ISubscriptionTarget<T>,
    private count: number,
    private source: Stream<T>
  ) {
    super(target)
  }

  public error(error: unknown): void {
    if (this.isActive()) {
      if (this.count === 0) {
        super.error(error)
        return
      }

      this.count -= 1
      this.disposeAndRecycle()
      this.source.subscribe(this)
    }
  }
}
