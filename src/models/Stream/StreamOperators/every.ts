import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function every<T>(
  predicate: (value: T, index: number) => boolean
): IOperator<T, boolean> {
  return new EveryOperator<T>(predicate)
}

class EveryOperator<T> implements IOperator<T, boolean> {
  constructor(private predicate: (value: T, index: number) => boolean) {}

  public connect(
    target: ISubscriber<boolean>,
    source: Stream<T>
  ): DisposableLike {
    return source.subscribe(new EverySubscriber(target, this.predicate))
  }
}

class EverySubscriber<T> extends ValueTransmitter<T, boolean> {
  private index: number = 0

  constructor(
    target: ISubscriber<boolean>,
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

    if (!isMatching) {
      this.destination.next(false)
      this.destination.complete()
    }
  }

  protected onComplete(): void {
    this.destination.next(true)
    this.destination.complete()
  }
}
