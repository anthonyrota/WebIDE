import { ISubscription } from 'src/models/Disposable/Subscription'
import {
  DoubleInputValueTransmitterWithData,
  DoubleInputValueTransmitterWithDataSubscriptionTarget
} from 'src/models/Stream/DoubleInputValueTransmitterWithData'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { empty } from 'src/models/Stream/StreamConstructors/empty'

export function race<T>(...streams: Array<Stream<T>>): Stream<T> {
  if (streams.length === 0) {
    return empty()
  }
  if (streams.length === 1) {
    return streams[0]
  }
  return new RawStream<T>(target => {
    return new RaceValueTransmitter<T>(target, streams)
  })
}

class RaceValueTransmitter<T> extends DoubleInputValueTransmitterWithData<
  never,
  T,
  T,
  number
> {
  private hasResolvedFirstStream: boolean = false
  private streamSubscriptions: ISubscription[] = []

  constructor(target: ISubscriptionTarget<T>, streams: Array<Stream<T>>) {
    super(target)

    for (let i = 0; i < streams.length && !this.hasResolvedFirstStream; i++) {
      const stream = streams[i]
      const subscription = this.subscribeStreamToSelf(stream, i)

      if (!this.hasResolvedFirstStream) {
        this.streamSubscriptions.push(subscription)
      }
    }
  }

  protected onOuterNextValue(
    value: T,
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<T, number>
  ) {
    if (!this.hasResolvedFirstStream) {
      this.hasResolvedFirstStream = true
      this.disposeNonActiveSubscriptions(target.getData())
    }

    this.destination.next(value)
  }

  private disposeNonActiveSubscriptions(activeSubscriptionIndex: number): void {
    for (let i = 0; i < this.streamSubscriptions.length; i++) {
      if (i !== activeSubscriptionIndex) {
        this.streamSubscriptions[i].dispose()
      }
    }
  }
}
