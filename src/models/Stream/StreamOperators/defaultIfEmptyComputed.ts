import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function defaultIfEmptyComputed<T>(
  getDefaultValue: () => T
): IOperator<T, T> {
  return new DefaultIfEmptyComputedOperator<T>(getDefaultValue)
}

class DefaultIfEmptyComputedOperator<T> implements IOperator<T, T> {
  constructor(private getDefaultValue: () => T) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new DefaultIfEmptyComputedSubscriber<T>(target, this.getDefaultValue)
    )
  }
}

class DefaultIfEmptyComputedSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private isEmpty: boolean = true

  constructor(target: ISubscriber<T>, private getDefaultValue: () => T) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.isEmpty = false
    this.destination.next(value)
  }

  protected onComplete(): void {
    if (this.isEmpty) {
      const { getDefaultValue } = this
      let defaultValue: T

      try {
        defaultValue = getDefaultValue()
      } catch (error) {
        this.destination.error(error)
        return
      }

      this.destination.next(defaultValue)
    }

    this.destination.complete()
  }
}
