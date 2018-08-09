import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function tapValue<T>(tapValue: () => void): IOperator<T, T> {
  return new TapValueOperator<T>(tapValue)
}

class TapValueOperator<T> implements IOperator<T, T> {
  constructor(private tapNextValue: (value: T) => void) {}

  public connect(
    target: ISubscriber<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new TapValueSubscriber<T>(target, this.tapNextValue)
    )
  }
}

class TapValueSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(
    target: ISubscriber<T>,
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
