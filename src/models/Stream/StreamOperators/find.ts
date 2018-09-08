import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function find<T>(
  predicate: (value: T, index: number) => boolean
): IOperator<T, T>
export function find<T, U extends T>(
  predicate: (value: T, index: number) => value is U
): IOperator<T, U>
export function find<T>(
  predicate: (value: T, index: number) => boolean
): IOperator<T, T> {
  return new FindOperator<T>(predicate)
}

class FindOperator<T> implements IOperator<T, T> {
  constructor(private predicate: (value: T, index: number) => boolean) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new FindSubscriber(target, this.predicate))
  }
}

class FindSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private index: number = 0

  constructor(
    target: ISubscriber<T>,
    private predicate: (value: T, index: number) => boolean
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { predicate } = this
    const index = this.index++
    let isMatching: boolean

    try {
      isMatching = predicate(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (isMatching) {
      this.destination.next(value)
      this.destination.complete()
    }
  }
}
