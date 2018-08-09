import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function tapComplete<T>(tapWhenComplete: () => void): IOperator<T, T> {
  return new TapCompleteOperator<T>(tapWhenComplete)
}

class TapCompleteOperator<T> implements IOperator<T, T> {
  constructor(private tapWhenComplete: () => void) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new TapCompleteSubscriber<T>(target, this.tapWhenComplete)
    )
  }
}

class TapCompleteSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, private tapWhenComplete: () => void) {
    super(target)
  }

  protected onComplete(): void {
    const { tapWhenComplete } = this

    try {
      tapWhenComplete()
    } catch (error) {
      this.destination.error(error)
      return
    }
    this.destination.complete()
  }
}
