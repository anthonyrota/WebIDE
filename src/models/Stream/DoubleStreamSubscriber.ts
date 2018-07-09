import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscription } from 'src/models/Stream/StreamSubscription'
import { createSymbol } from 'src/utils/createSymbol'

const setSubscriptionAccessor = createSymbol('__setSubscription')

export interface IDoubleStreamSubscriber<T> {
  error?(error: any): void
  complete?(): void
  onOuterNextValue?(value: T, subscription: StreamSubscription): void
  onOuterError?(error: any, subscription: StreamSubscription): void
  onOuterComplete?(subscription: StreamSubscription): void
}

export function subscribeStreamToDoubleStreamSubscriber<T>(
  stream: Stream<T>,
  subscriber: IDoubleStreamSubscriber<T>
): StreamSubscription {
  const subscriptionTarget = new DoubleStreamSubscriber<T>(subscriber)
  const subscription = stream.subscribe(subscriptionTarget)

  subscriptionTarget[setSubscriptionAccessor](subscription)

  return subscription
}

class DoubleStreamSubscriber<T> implements IStreamSubscriber<T> {
  private __subscription: StreamSubscription

  constructor(private subscriber: IDoubleStreamSubscriber<T>) {}

  public next(value: T): void {
    if (this.subscriber.onOuterNextValue) {
      this.subscriber.onOuterNextValue(value, this.__subscription)
    }
  }

  public error(error: any): void {
    if (this.subscriber.onOuterError) {
      this.subscriber.onOuterError(error, this.__subscription)
    } else if (this.subscriber.error) {
      this.subscriber.error(error)
    }
  }

  public complete(): void {
    if (this.subscriber.onOuterComplete) {
      this.subscriber.onOuterComplete(this.__subscription)
    } else if (this.subscriber.complete) {
      this.subscriber.complete()
    }
  }

  public [setSubscriptionAccessor](subscription: StreamSubscription) {
    if (this.__subscription) {
      throw new TypeError('private method')
    }
    this.__subscription = subscription
  }
}
