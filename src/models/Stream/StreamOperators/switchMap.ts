import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { Subscription } from 'src/models/Disposable/Subscription'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function switchMap<T, U>(
  convertValueToStream: (value: T, index: number) => Stream<U>
): IOperator<T, U> {
  return new SwitchMapOperator<T, U>(convertValueToStream)
}

class SwitchMapOperator<T, U> implements IOperator<T, U> {
  constructor(
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {}

  public connect(target: ISubscriber<U>, source: Stream<T>): IDisposableLike {
    return source.subscribe(
      new SwitchMapSubscriber<T, U>(target, this.convertValueToStream)
    )
  }
}

class SwitchMapSubscriber<T, U> extends DoubleInputValueTransmitter<T, U, U> {
  private index: number = 0
  private lastStreamSubscription: Subscription | null = null

  constructor(
    target: ISubscriber<U>,
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { convertValueToStream } = this
    const index = this.index++
    let resultStream: Stream<U>

    try {
      resultStream = convertValueToStream(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (this.lastStreamSubscription) {
      this.lastStreamSubscription.dispose()
    }

    this.lastStreamSubscription = this.subscribeStreamToSelf(resultStream)
  }

  protected onComplete(): void {
    if (
      !this.lastStreamSubscription ||
      !this.lastStreamSubscription.isActive()
    ) {
      this.destination.complete()
    }
  }

  protected onOuterComplete(): void {
    this.lastStreamSubscription = null
    if (!this.isReceivingValues()) {
      this.destination.complete()
    }
  }

  protected onOuterNextValue(value: U): void {
    this.destination.next(value)
  }
}
