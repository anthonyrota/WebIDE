import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { MonoTypeStreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const tapValue: {
  <T>(tapNextValue: (value: T) => void): (source: Stream<T>) => Stream<T>
  <T>(tapNextValue: (value: T) => void, source: Stream<T>): Stream<T>
} = curry2(
  <T>(tapNextValue: (value: T) => void, source: Stream<T>): Stream<T> => {
    return source.lift(new TapValueOperator<T>(tapNextValue))
  }
)

class TapValueOperator<T> implements IOperator<T, T> {
  constructor(private tapNextValue: (value: T) => void) {}

  public call(
    target: StreamSubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new TapValueSubscriber<T>(target, this.tapNextValue)
    )
  }
}

class TapValueSubscriber<T> extends MonoTypeStreamValueTransmitter<T> {
  constructor(
    target: IStreamSubscriber<T>,
    private tapNextValue: (value: T) => void
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    try {
      this.tapNextValue(value)
    } catch (error) {
      this.destination.error(error)
      return
    }
    this.destination.next(value)
  }
}
