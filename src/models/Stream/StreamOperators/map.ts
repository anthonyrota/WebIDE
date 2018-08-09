import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function map<T, U>(transform: (value: T) => U): IOperator<T, U> {
  return new MapOperator<T, U>(transform)
}

class MapOperator<T, U> implements IOperator<T, U> {
  constructor(private transform: (value: T) => U) {}

  public connect(target: ISubscriber<U>, source: Stream<T>): DisposableLike {
    return source.subscribe(new MapSubscriber<T, U>(target, this.transform))
  }
}

class MapSubscriber<T, U> extends ValueTransmitter<T, U> {
  constructor(target: ISubscriber<U>, private transform: (value: T) => U) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { transform, destination } = this
    let transformedValue: U

    try {
      transformedValue = transform(value)
    } catch (error) {
      destination.error(error)
      return
    }

    destination.next(transformedValue)
  }
}
