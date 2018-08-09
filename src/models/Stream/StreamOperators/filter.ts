import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function filter<T>(
  predicate: (value: T) => boolean
): IOperator<T, T> {
  return new FilterOperator<T>(predicate)
}

class FilterOperator<T> implements IOperator<T, T> {
  constructor(private predicate: (value: T) => boolean) {}

  public connect(
    target: ISubscriber<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new FilterSubscriber<T>(target, this.predicate))
  }
}

class FilterSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(
    target: ISubscriber<T>,
    private predicate: (value: T) => boolean
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { predicate, destination } = this
    let distributeValue: boolean

    try {
      distributeValue = predicate(value)
    } catch (error) {
      destination.error(error)
      return
    }

    if (distributeValue) {
      destination.next(value)
    }
  }
}
