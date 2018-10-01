import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { operate, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function repeatAlways<T>(): Operation<T, T> {
  return operate((source, target) =>
    source.subscribe(new RepeatAlwaysValueTransmitter(target, source))
  )
}

class RepeatAlwaysValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriptionTarget<T>, private source: Stream<T>) {
    super(target)
  }

  public complete(): void {
    if (this.isActive()) {
      this.disposeAndRecycle()
      this.source.subscribe(this)
    }
  }
}
