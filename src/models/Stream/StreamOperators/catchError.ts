import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { MonoTypeDoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function catchError<T, U>(
  convertErrorToStream: (error: unknown) => Stream<U>
): IOperator<T, T | U> {
  return new CatchErrorOperator<T, U>(convertErrorToStream)
}

class CatchErrorOperator<T, U> implements IOperator<T, T | U> {
  constructor(private convertErrorToStream: (error: unknown) => Stream<U>) {}

  public connect(
    target: ISubscriber<T | U>,
    source: Stream<T>
  ): DisposableLike {
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
    private convertErrorToStream: (error: unknown) => Stream<U>
  ) {
    super(target)
  }

  public error(error: unknown): void {
    if (this.isActive()) {
      const { convertErrorToStream } = this
      let resultStream: Stream<U>

      try {
        resultStream = convertErrorToStream(error)
      } catch (conversionError) {
        super.error(conversionError)
        return
      }

      this.disposeAndRecycle()
      this.subscribeStreamToSelf(resultStream)
    }
  }
}
