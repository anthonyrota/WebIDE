import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function tap<T>(subscriber: ISubscriber<T>): IOperator<T, T> {
  return new TapOperator<T>(subscriber)
}

class TapOperator<T> implements IOperator<T, T> {
  constructor(private subscriber: ISubscriber<T>) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new TapSubscriber<T>(target, this.subscriber))
  }
}

class TapSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, private subscriber: ISubscriber<T>) {
    super(target)
  }

  protected onNextValue(value: T): void {
    try {
      if (this.subscriber.next) {
        this.subscriber.next(value)
      }
    } catch (error) {
      this.destination.error(error)
      return
    }
    this.destination.next(value)
  }

  protected onError(error: T): void {
    try {
      if (this.subscriber.error) {
        this.subscriber.error(error)
      }
    } catch (tapError) {
      this.destination.error(tapError)
      return
    }
    this.destination.next(error)
  }

  protected onComplete(): void {
    try {
      if (this.subscriber.complete) {
        this.subscriber.complete()
      }
    } catch (tapError) {
      this.destination.error(tapError)
      return
    }
    this.destination.complete()
  }
}
