import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function throwIfEmpty<T>(getError: () => any): IOperator<T, T> {
  return new ThrowIfEmptyOperator<T>(getError)
}

class ThrowIfEmptyOperator<T> implements IOperator<T, T> {
  constructor(private getError: () => any) {}

  public connect(
    target: ISubscriber<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new ThrowIfEmptySubscriber<T>(target, this.getError)
    )
  }
}

class ThrowIfEmptySubscriber<T> extends MonoTypeValueTransmitter<T> {
  private hasValue: boolean = false

  constructor(subscriber: ISubscriber<T>, private getError: any) {
    super(subscriber)
  }

  public onNextValue(value: T): void {
    this.hasValue = true
    this.destination.next(value)
  }

  public complete(): void {
    if (this.hasValue) {
      this.destination.complete()
    } else {
      let computedError: any

      try {
        computedError = this.getError()
      } catch (error) {
        this.destination.error(error)
        return
      }

      this.destination.error(computedError)
    }
  }
}
