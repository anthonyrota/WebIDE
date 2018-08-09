import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { ISubscriber } from 'src/models/Stream/ISubscriber'

export function exhaust<T>(): IOperator<Stream<T>, T> {
  return new ExhaustOperator<T>()
}

class ExhaustOperator<T> implements IOperator<Stream<T>, T> {
  public connect(
    target: ISubscriber<T>,
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
