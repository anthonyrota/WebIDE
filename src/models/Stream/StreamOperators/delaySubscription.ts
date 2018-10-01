import { IDisposable } from 'src/models/Disposable/IDisposable'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { operate, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function delaySubscription<T>(
  onShouldSubscribeToSourceStream: Stream<unknown>
): Operation<T, T> {
  return operate(
    (source, target) =>
      new DelaySubscriptionValueTransmitter(
        target,
        onShouldSubscribeToSourceStream,
        source
      )
  )
}

class DelaySubscriptionValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private sourceSubscription: IDisposable

  constructor(
    target: ISubscriptionTarget<T>,
    onShouldSubscribeToSourceStream: Stream<unknown>,
    private source: Stream<T>
  ) {
    super(target)
    this.sourceSubscription = this.subscribeStreamToSelf(
      onShouldSubscribeToSourceStream
    )
  }

  protected onOuterNextValue(): void {
    this.subscribeToSource()
  }

  protected onOuterComplete(): void {
    this.subscribeToSource()
  }

  private subscribeToSource(): void {
    this.sourceSubscription.dispose()
    this.source.subscribe(this)
  }
}
