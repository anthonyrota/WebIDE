import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function throwIfEmptyComputed<T>(
  getError: () => unknown
): IOperator<T, T> {
  return new ThrowIfEmptyComputedOperator<T>(getError)
}

class ThrowIfEmptyComputedOperator<T> implements IOperator<T, T> {
  constructor(private getError: () => unknown) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new ThrowIfEmptyComputedSubscriber<T>(target, this.getError)
    )
  }
}

class ThrowIfEmptyComputedSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private hasValue: boolean = false

  constructor(subscriber: ISubscriber<T>, private getError: () => unknown) {
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
      let computedError: unknown

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
