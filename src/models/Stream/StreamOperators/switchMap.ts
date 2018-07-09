import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  IDoubleStreamSubscriber,
  subscribeStreamToDoubleStreamSubscriber
} from 'src/models/Stream/DoubleStreamSubscriber'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscription } from 'src/models/Stream/StreamSubscription'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { StreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
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
    target: StreamSubscriptionTarget<U>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new SwitchMapSubscriber<T, U>(target, this.convertValueToStream)
    )
  }
}

class SwitchMapSubscriber<T, U> extends StreamValueTransmitter<T, U>
  implements IDoubleStreamSubscriber<U> {
  private index: number = 0
  private latestStreamSubscription?: StreamSubscription
  private cancelTerminatingSubscriptionDisposable?: IConsciousDisposable

  constructor(
    target: IStreamSubscriber<U>,
    private convertValueToStream: (value: T, index: number) => Stream<U>
  ) {
    super(target)
  }

  public onOuterNextValue(value: U): void {
    this.destination.next(value)
  }

  public onOuterComplete(): void {
    if (!this.isActive()) {
      super.complete()
    }
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

    if (this.latestStreamSubscription) {
      this.latestStreamSubscription.dispose()
    }

    if (this.cancelTerminatingSubscriptionDisposable) {
      this.cancelTerminatingSubscriptionDisposable.dispose()
    }

    this.latestStreamSubscription = subscribeStreamToDoubleStreamSubscriber(
      resultStream,
      this
    )
    this.cancelTerminatingSubscriptionDisposable = this.terminateDisposableWhenDisposed(
      this.latestStreamSubscription
    )
  }

  protected onComplete(): void {
    if (
      !this.latestStreamSubscription ||
      !this.latestStreamSubscription.isActive()
    ) {
      super.onComplete()
    }
  }
}
