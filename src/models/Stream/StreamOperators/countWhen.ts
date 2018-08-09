import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function countWhen<T>(
  predicate: (value: T, index: number) => boolean
): IOperator<T, number> {
  return new CountWhenOperator(predicate)
}

class CountWhenOperator<T> implements IOperator<T, number> {
  constructor(private predicate: (value: T, index: number) => boolean) {}

  public connect(
    target: ISubscriber<number>,
    source: Stream<T>
  ): DisposableLike {
    return source.subscribe(new CountWhenSubscriber(target, this.predicate))
  }
}

class CountWhenSubscriber<T> extends ValueTransmitter<T, number> {
  private count: number = 0
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
    let shouldIncreaseCount: boolean

    try {
      shouldIncreaseCount = predicate(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (shouldIncreaseCount) {
      this.count++
    }
  }

  protected onComplete(): void {
    this.destination.next(this.count)
    this.destination.complete()
  }
}
