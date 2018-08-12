import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function delaySubscription<T>(
  onShouldSubscribeToSourceStream: Stream<unknown>
): IOperator<T, T> {
  return new DelaySubscriptionOperator<T>(onShouldSubscribeToSourceStream)
}

class DelaySubscriptionOperator<T> implements IOperator<T, T> {
  constructor(private onShouldSubscribeToSourceStream: Stream<unknown>) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return new DelaySubscriptionSubscriber(
      target,
      this.onShouldSubscribeToSourceStream,
      source
    )
  }
}

class DelaySubscriptionSubscriber<T> extends DoubleInputValueTransmitter<
  T,
  T,
  unknown
> {
  private sourceSubscription: IDisposable

  constructor(
    target: ISubscriber<T>,
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
