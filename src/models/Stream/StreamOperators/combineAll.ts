import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import {
  DoubleInputValueTransmitterWithData,
  DoubleInputValueTransmitterWithDataSubscriptionTarget
} from 'src/models/Stream/DoubleInputValueTransmitterWithData'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function combineAll<T>(): IOperator<Stream<T>, T[]> {
  return new CombineAllOperator<T>()
}

class CombineAllOperator<T> implements IOperator<Stream<T>, T[]> {
  public connect(
    target: ISubscriber<T[]>,
    source: Stream<Stream<T>>
  ): DisposableLike {
    return source.subscribe(new CombineAllSubscriber<T>(target))
  }
}

interface IStreamData {
  hasReceivedValue: boolean
  index: number
}

class CombineAllSubscriber<T> extends DoubleInputValueTransmitterWithData<
  Stream<T>,
  T[],
  T,
  IStreamData
> {
  private values: T[] = []
  private index: number = 0
  private streamsCount: number = 0
  private streamsCompletedCount: number = 0
  private streamsWithValuesCount: number = 0

  protected onNextValue(stream: Stream<T>): DisposableLike {
    this.streamsCount += 1
    this.subscribeStreamToSelf(stream, {
      hasReceivedValue: false,
      index: this.index++
    })
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

    if (this.streamsWithValuesCount === this.streamsCount) {
      this.destination.next(this.values.slice())
    }
  }

  protected onOuterComplete(): void {
    this.streamsCompletedCount += 1
    if (this.streamsCompletedCount === this.streamsCount) {
      this.destination.complete()
    }
  }
}
