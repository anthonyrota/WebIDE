import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  DoubleInputValueTransmitterSubscriptionTarget,
  DoubleInputValueTransmitterWithSameOutputAndOuterTypes
} from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const switchMap: {
  <T, U>(convertValueToStream: (value: T, index: number) => Stream<U>): (
    source: Stream<T>
  ) => Stream<U>
  <T, U>(
    convertValueToStream: (value: T, index: number) => Stream<U>,
    source: Stream<T>
  ): Stream<U>
} = curry2(
  <T, U>(
    convertValueToStream: (value: T, index: number) => Stream<U>,
    source: Stream<T>
  ): Stream<U> => {
    return source.lift(new SwitchMapOperator<T, U>(convertValueToStream))
  }
)

class SwitchMapOperator<T, U> implements IOperator<T, U> {
  constructor(
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {}

  public call(
    target: MonoTypeValueTransmitter<U>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new SwitchMapSubscriber<T, U>(target, this.convertValueToStream)
    )
  }
}

class SwitchMapSubscriber<
  T,
  U
> extends DoubleInputValueTransmitterWithSameOutputAndOuterTypes<T, U> {
  private index: number = 0
  private lastStreamSubscription: DoubleInputValueTransmitterSubscriptionTarget<
    U
  > | null = null

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
      super.onComplete()
    }
  }

  protected onOuterComplete(): void {
    this.lastStreamSubscription = null
    this.destination.complete()
  }
}
