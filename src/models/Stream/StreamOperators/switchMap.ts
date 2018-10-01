import { Subscription } from 'src/models/Disposable/Subscription'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function switchMap<T, U>(
  convertValueToStream: (value: T, index: number) => Stream<U>
): Operation<T, U> {
  return operateThroughValueTransmitter(
    target => new SwitchMapValueTransmitter(target, convertValueToStream)
  )
}

class SwitchMapValueTransmitter<T, U> extends DoubleInputValueTransmitter<
  T,
  U,
  U
> {
  private index: number = 0
  private lastStreamSubscription: Subscription | null = null

  constructor(
    target: ISubscriptionTarget<U>,
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
