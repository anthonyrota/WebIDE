import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function mapTo<T>(value: T): IOperator<any, T> {
  return new MapToOperator<T>(value)
}

class MapToOperator<T> implements IOperator<any, T> {
  constructor(private value: T) {}

  public connect(target: ISubscriber<T>, source: Stream<any>): DisposableLike {
    return source.subscribe(new MapToSubscriber<T>(target, this.value))
  }
}

class MapToSubscriber<T> extends ValueTransmitter<any, T> {
  constructor(target: ISubscriber<T>, private value: T) {
    super(target)
  }

  protected onNextValue(): void {
    this.destination.next(this.value)
  }
}
