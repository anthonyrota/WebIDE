import {
  DoubleInputValueTransmitterWithData,
  DoubleInputValueTransmitterWithDataSubscriptionTarget
} from 'src/models/Stream/DoubleInputValueTransmitterWithData'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { empty } from 'src/models/Stream/StreamConstructors/empty'

export function combineLatest(): Stream<never>
export function combineLatest<T>(v1: Stream<T>): Stream<[T]>
export function combineLatest<T, T2>(
  v1: Stream<T>,
  v2: Stream<T2>
): Stream<[T, T2]>
export function combineLatest<T, T2, T3>(
  v1: Stream<T>,
  v2: Stream<T2>,
  v3: Stream<T3>
): Stream<[T, T2, T3]>
export function combineLatest<T, T2, T3, T4>(
  v1: Stream<T>,
  v2: Stream<T2>,
  v3: Stream<T3>,
  v4: Stream<T4>
): Stream<[T, T2, T3, T4]>
export function combineLatest<T, T2, T3, T4, T5>(
  v1: Stream<T>,
  v2: Stream<T2>,
  v3: Stream<T3>,
  v4: Stream<T4>,
  v5: Stream<T5>
): Stream<[T, T2, T3, T4, T5]>
export function combineLatest<T, T2, T3, T4, T5, T6>(
  v1: Stream<T>,
  v2: Stream<T2>,
  v3: Stream<T3>,
  v4: Stream<T4>,
  v5: Stream<T5>,
  v6: Stream<T6>
): Stream<[T, T2, T3, T4, T5, T6]>
export function combineLatest<T>(...streams: Array<Stream<T>>): Stream<T[]>
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
> extends DoubleInputValueTransmitterWithData<T, T[], T, IStreamData> {
  private values: T[] = []
  private streamsCompletedCount: number = 0
  private streamsWithValuesCount: number = 0

  constructor(target: ISubscriber<T[]>, private streams: Array<Stream<T>>) {
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
