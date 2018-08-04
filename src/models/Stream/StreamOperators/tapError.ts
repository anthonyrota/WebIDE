import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function tapError<T>(tapOnError: () => void): IConnectOperator<T, T> {
  return new TapErrorOperator<T>(tapOnError)
}

class TapErrorOperator<T> implements IConnectOperator<T, T> {
  constructor(private tapNextError: (error: any) => void) {}

  public connect(
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
