import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { MonoTypeDoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const catchError: {
  <T, U>(convertErrorToStream: (error: any) => Stream<U>): (
    source: Stream<T>
  ) => Stream<T | U>
  <T, U>(
    convertErrorToStream: (error: any) => Stream<U>,
    source: Stream<T>
  ): Stream<T | U>
} = curry2(
  <T, U>(
    convertErrorToStream: (error: any) => Stream<U>,
    source: Stream<T>
  ): Stream<T | U> => {
    return source.lift(new CatchErrorOperator<T, U>(convertErrorToStream))
  }
)

class CatchErrorOperator<T, U> implements IOperator<T, T | U> {
  constructor(private convertErrorToStream: (error: any) => Stream<U>) {}

  public call(
    target: MonoTypeValueTransmitter<T | U>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new CatchErrorSubscriber<T, U>(target, this.convertErrorToStream)
    )
  }
}

class CatchErrorSubscriber<T, U> extends MonoTypeDoubleInputValueTransmitter<
  T | U
> {
  constructor(
    target: ISubscriber<T | U>,
    private convertErrorToStream: (error: any) => Stream<U>
  ) {
    super(target)
  }

  public error(error: any): void {
    if (this.isActive()) {
      const { convertErrorToStream } = this
      let resultStream: Stream<U>

      try {
        resultStream = convertErrorToStream(error)
      } catch (conversionError) {
        super.error(conversionError)
        return
      }

      this.recycle()
      this.subscribeStreamToSelf(resultStream)
    }
  }
}
