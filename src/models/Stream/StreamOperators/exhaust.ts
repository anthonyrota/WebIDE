import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function exhaust<T>(): IConnectOperator<Stream<T>, T> {
  return new ExhaustOperator<T>()
}

class ExhaustOperator<T> implements IConnectOperator<Stream<T>, T> {
  public connect(
    target: MonoTypeValueTransmitter<T>,
    source: Stream<Stream<T>>
  ): IDisposableLike {
    return source.subscribe(new ExhaustSubscriber<T>(target))
  }
}

class ExhaustSubscriber<T> extends DoubleInputValueTransmitter<
  Stream<T>,
  T,
  T
> {
  private hasActiveStream: boolean = false

  protected onNextValue(stream: Stream<T>): void {
    if (!this.hasActiveStream) {
      this.hasActiveStream = true
      this.subscribeStreamToSelf(stream)
    }
  }

  protected onComplete(): void {
    if (!this.hasActiveStream) {
      this.destination.complete()
    }
  }

  protected onOuterComplete(): void {
    this.hasActiveStream = false
    if (!this.isReceivingValues()) {
      this.destination.complete()
    }
  }
}
