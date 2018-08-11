import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function skipWhile<T>(
  predicate: (value: T, index: number) => boolean
): IOperator<T, T> {
  return new SkipWhileOperator<T>(predicate)
}

class SkipWhileOperator<T> implements IOperator<T, T> {
  constructor(private predicate: (value: T, index: number) => boolean) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new SkipWhileSubscriber<T>(target, this.predicate))
  }
}

class SkipWhileSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private hasStoppedSkippingValues: boolean = false
  private index: number = 0

  constructor(
    target: ISubscriber<T>,
    private predicate: (value: T, index: number) => boolean
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.hasStoppedSkippingValues) {
      this.destination.next(value)
      return
    }

    const { predicate } = this
    const index = this.index++
    let shouldContinueSkippingValues: boolean

    try {
      shouldContinueSkippingValues = predicate(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (!shouldContinueSkippingValues) {
      this.hasStoppedSkippingValues = true
      this.destination.next(value)
    }
  }
}
