import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function findIndex<T>(
  predicate: (value: T, index: number) => boolean
): IOperator<T, number> {
  return new FindIndexOperator<T>(predicate)
}

class FindIndexOperator<T> implements IOperator<T, number> {
  constructor(private predicate: (value: T, index: number) => boolean) {}

  public connect(
    target: ISubscriber<number>,
    source: Stream<T>
  ): DisposableLike {
    return source.subscribe(new FindIndexSubscriber(target, this.predicate))
  }
}

class FindIndexSubscriber<T> extends ValueTransmitter<T, number> {
  private index: number = 0

  constructor(
    target: ISubscriber<number>,
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
      this.destination.next(this.index)
      this.destination.complete()
    }
  }
}
