import {
  DoubleInputValueTransmitterWithData,
  DoubleInputValueTransmitterWithDataSubscriptionTarget
} from 'src/models/Stream/DoubleInputValueTransmitterWithData'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { empty } from 'src/models/Stream/StreamConstructors/empty'
import { map } from 'src/models/Stream/StreamOperators/map'
import { UnwrapFromStreams } from 'src/models/Stream/types'
import { ToTuple } from 'src/types/utils'
import { wrapInArray } from 'src/utils/wrapInArray'

export function zip(): Stream<never>
export function zip<T extends Array<Stream<any>>>(
  ...streams: T
): Stream<ToTuple<UnwrapFromStreams<T>>>
export function zip<T>(...streams: Array<Stream<T>>): Stream<T[]> {
  return streams.length === 0
    ? empty()
    : streams.length === 1
      ? streams[0].lift(map(wrapInArray))
      : new RawStream(target => {
          return new ZipValueTransmitter<T>(target, streams)
        })
}

class ZipValueTransmitter<T> extends DoubleInputValueTransmitterWithData<
  never,
  T[],
  T,
  number
> {
  private streamsValues: T[][] = []
  private streamsCompletedCount: number = 0

  constructor(target: ISubscriptionTarget<T[]>, private streams: Array<Stream<T>>) {
    super(target)

    for (let i = 0; i < this.streams.length; i++) {
      this.streamsValues[i] = []
      this.subscribeStreamToSelf(this.streams[i], i)
    }
  }

  protected onOuterNextValue(
    value: T,
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<T, number>
  ): void {
    this.streamsValues[target.getData()].push(value)

    if (this.streamsValues.every(values => values.length > 0)) {
      this.destination.next(this.streamsValues.map(values => values.shift()!))
    }
  }

  protected onOuterComplete(
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<T, number>
  ): void {
    if (this.streamsValues[target.getData()].length === 0) {
      this.destination.complete()
      return
    }

    this.streamsCompletedCount += 1

    if (this.streamsCompletedCount === this.streams.length) {
      this.destination.complete()
    }
  }
}
