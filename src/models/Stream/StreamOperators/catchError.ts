import { MonoTypeDoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function catchError<T, U>(
  convertErrorToStream: (error: unknown) => Stream<U>
): Operation<T, T | U> {
  return operateThroughValueTransmitter(
    target => new CatchErrorValueTransmitter<T, U>(target, convertErrorToStream)
  )
}

class CatchErrorValueTransmitter<
  T,
  U
> extends MonoTypeDoubleInputValueTransmitter<T | U> {
  constructor(
    target: ISubscriptionTarget<T | U>,
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
