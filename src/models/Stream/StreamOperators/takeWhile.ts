import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function takeWhile<T>(
  predicate: (value: T, index: number) => boolean
): IConnectOperator<T, T> {
  return new TakeWhileOperator<T>(predicate)
}

class TakeWhileOperator<T> implements IConnectOperator<T, T> {
  constructor(private predicate: (value: T, index: number) => boolean) {}

  public connect(
    target: MonoTypeValueTransmitter<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new TakeWhileSubscriber<T>(target, this.predicate))
  }
}

class TakeWhileSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private index: number = 0

  constructor(
    target: ISubscriber<T>,
    private predicate: (value: T, index: number) => boolean
  ) {
    super(target)
  }

  public onNextValue(value: T): void {
    const { predicate } = this
    const index = this.index++
    let shouldDistributeValue: boolean

    try {
      shouldDistributeValue = predicate(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (shouldDistributeValue) {
      this.destination.next(value)
    } else {
      this.destination.complete()
    }
  }
}
