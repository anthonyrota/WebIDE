import {
  DoubleInputValueTransmitterWithData,
  DoubleInputValueTransmitterWithDataSubscriptionTarget
} from 'src/models/Stream/DoubleInputValueTransmitterWithData'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { empty } from 'src/models/Stream/StreamConstructors/empty'
import { ToTuple } from 'src/types/utils'
import { UnwrapFromStreams } from '../types'

export function combineLatest(): Stream<never>
export function combineLatest<T extends Array<Stream<any>>>(
  ...streams: T
): Stream<ToTuple<UnwrapFromStreams<T>>>
export function combineLatest<T>(...streams: Array<Stream<T>>): Stream<T[]> {
  return streams.length === 0
    ? empty()
    : new RawStream<T[]>(target => {
        return new CombineLatestValueTransmitter(target, streams)
      })
}

interface IStreamData {
  hasReceivedValue: boolean
  index: number
}

class CombineLatestValueTransmitter<
  T
> extends DoubleInputValueTransmitterWithData<never, T[], T, IStreamData> {
  private values: T[] = []
  private streamsCompletedCount: number = 0
  private streamsWithValuesCount: number = 0

  constructor(target: ISubscriptionTarget<T[]>, private streams: Array<Stream<T>>) {
    super(target)

    for (let i = 0; i < this.streams.length; i++) {
      this.subscribeStreamToSelf(this.streams[i], {
        hasReceivedValue: false,
        index: i
      })
    }
  }

  protected onOuterNextValue(
    value: T,
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<
      T,
      IStreamData
    >
  ) {
    const data = target.getData()

    if (!data.hasReceivedValue) {
      data.hasReceivedValue = true
      this.streamsWithValuesCount++
    }

    this.values[data.index] = value

    if (this.streamsWithValuesCount === this.streams.length) {
      this.destination.next(this.values.slice())
    }
  }

  protected onOuterComplete(): void {
    this.streamsCompletedCount += 1
    if (this.streamsCompletedCount === this.streams.length) {
      this.destination.complete()
    }
  }
}
