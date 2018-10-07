import {
  DoubleInputValueTransmitterWithData,
  DoubleInputValueTransmitterWithDataSubscriptionTarget
} from 'src/models/Stream/DoubleInputValueTransmitterWithData'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { empty } from 'src/models/Stream/StreamConstructors/empty'
import { ToTuple } from 'src/types/utils'
import { map } from '../StreamOperators/map'
import { UnwrapFromStreams } from '../types'

export interface IValuesWithEmittedStreamIndex<T extends any[]> {
  values: T
  emittedStreamIndex: number
}

export function combineLatestIncludingEmittedStreamIndex(): Stream<never>
export function combineLatestIncludingEmittedStreamIndex<
  T extends Array<Stream<any>>
>(
  ...streams: T
): Stream<IValuesWithEmittedStreamIndex<ToTuple<UnwrapFromStreams<T>>>>
export function combineLatestIncludingEmittedStreamIndex<T>(
  ...streams: Array<Stream<T>>
): Stream<IValuesWithEmittedStreamIndex<T[]>> {
  return streams.length === 0
    ? empty()
    : streams.length === 1
      ? streams[0].lift(
          map(value => ({ values: [value], emittedStreamIndex: 0 }))
        )
      : new RawStream<IValuesWithEmittedStreamIndex<T[]>>(target => {
          return new CombineLatestIncludingEmittedStreamIndexValueTransmitter(
            target,
            streams
          )
        })
}

interface IStreamData {
  hasReceivedValue: boolean
  index: number
}

class CombineLatestIncludingEmittedStreamIndexValueTransmitter<
  T
> extends DoubleInputValueTransmitterWithData<
  never,
  IValuesWithEmittedStreamIndex<T[]>,
  T,
  IStreamData
> {
  private values: T[] = []
  private streamsCompletedCount: number = 0
  private streamsWithValuesCount: number = 0

  constructor(
    target: ISubscriptionTarget<IValuesWithEmittedStreamIndex<T[]>>,
    private streams: Array<Stream<T>>
  ) {
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
      this.destination.next({
        values: this.values.slice(),
        emittedStreamIndex: data.index
      })
    }
  }

  protected onOuterComplete(
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<
      T,
      IStreamData
    >
  ): void {
    if (!target.getData().hasReceivedValue) {
      this.destination.complete()
      return
    }

    this.streamsCompletedCount += 1

    if (this.streamsCompletedCount === this.streams.length) {
      this.destination.complete()
    }
  }
}
