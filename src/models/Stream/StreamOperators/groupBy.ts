import { ControlledStream } from 'src/models/Stream/ControlledStream'
import {
  DoubleInputValueTransmitterWithData,
  DoubleInputValueTransmitterWithDataSubscriptionTarget
} from 'src/models/Stream/DoubleInputValueTransmitterWithData'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export interface IGroupedStream<T, K> extends Stream<T> {
  getKey(): K
}

export function groupBy<T, K>(
  selectKey: (value: T, index: number) => K,
  selectGroupDurationStream?: (
    group: IGroupedStream<T, K>,
    groupInitializerValue: T,
    valuesIndex: number
  ) => Stream<unknown>
): Operation<T, IGroupedStream<T, K>> {
  return operateThroughValueTransmitter(
    target =>
      new GroupByValueTransmitter(target, selectKey, selectGroupDurationStream)
  )
}

class GroupByValueTransmitter<T, K> extends DoubleInputValueTransmitterWithData<
  T,
  IGroupedStream<T, K>,
  unknown,
  GroupedDistributiveStream<T, K>
> {
  private groupsByKey: Map<K, GroupedDistributiveStream<T, K>> = new Map()
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<IGroupedStream<T, K>>,
    private selectKey: (value: T, index: number) => K,
    private selectGroupDurationStream?: (
      group: IGroupedStream<T, K>,
      groupInitializerValue: T,
      valuesIndex: number
    ) => Stream<unknown>
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { selectKey } = this
    const index = this.index++
    let key: K

    try {
      key = selectKey(value, index)
    } catch (error) {
      this.distributeError(error)
      return
    }

    let group = this.groupsByKey.get(key)

    if (!group) {
      group = new GroupedDistributiveStream<T, K>(key)

      this.groupsByKey.set(key, group)

      if (this.selectGroupDurationStream) {
        const { selectGroupDurationStream } = this
        let durationStream: Stream<unknown>

        try {
          durationStream = selectGroupDurationStream(group, value, index)
        } catch (error) {
          this.distributeError(error)
          return
        }

        this.subscribeStreamToSelf(durationStream, group)
      }

      this.destination.next(group)
    }

    group.next(value)
  }

  protected onError(error: unknown): void {
    this.distributeError(error)
  }

  protected onComplete(): void {
    this.distributeCompletion()
  }

  protected onOuterNextValue(
    value: unknown,
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<
      unknown,
      GroupedDistributiveStream<T, K>
    >
  ) {
    this.removeGroup(target.getData())
  }

  protected onOuterComplete(
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<
      unknown,
      GroupedDistributiveStream<T, K>
    >
  ): void {
    this.removeGroup(target.getData())
  }

  private removeGroup(group: GroupedDistributiveStream<T, K>): void {
    group.complete()
    this.groupsByKey.delete(group.getKey())
  }

  private distributeError(error: unknown): void {
    this.groupsByKey.forEach(group => group.error(error))
    this.destination.error(error)
  }

  private distributeCompletion(): void {
    this.groupsByKey.forEach(group => group.complete())
    this.destination.complete()
  }
}

class GroupedDistributiveStream<T, K> extends ControlledStream<T>
  implements IGroupedStream<T, K> {
  constructor(private key: K) {
    super()
  }

  public getKey(): K {
    return this.key
  }
}
