import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const tapError: {
  <T>(tapNextError: (error: any) => void): (source: Stream<T>) => Stream<T>
  <T>(tapNextError: (error: any) => void, source: Stream<T>): Stream<T>
} = curry2(
  <T>(tapNextError: (error: any) => void, source: Stream<T>): Stream<T> => {
    return source.lift(new TapErrorOperator<T>(tapNextError))
  }
)

class TapErrorOperator<T> implements IOperator<T, T> {
  constructor(private tapNextError: (error: any) => void) {}

  public call(
    target: MonoTypeValueTransmitter<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new TapErrorSubscriber<T>(target, this.tapNextError)
    )
  }
}

class TapErrorSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(
    target: ISubscriber<T>,
    private tapNextError: (error: any) => void
  ) {
    super(target)
  }

  protected onError(error: any): void {
    try {
      this.tapNextError(error)
    } catch (tapError) {
      this.destination.error(tapError)
      return
    }
    this.destination.error(error)
  }
}
