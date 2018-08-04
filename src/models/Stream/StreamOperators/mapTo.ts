import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import {
  MonoTypeValueTransmitter,
  ValueTransmitter
} from 'src/models/Stream/ValueTransmitter'

export function mapTo<T>(value: T): IConnectOperator<any, T> {
  return new MapToOperator<T>(value)
}

class MapToOperator<T> implements IConnectOperator<any, T> {
  constructor(private value: T) {}

  public connect(
    target: MonoTypeValueTransmitter<T>,
    source: Stream<any>
  ): IDisposableLike {
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
