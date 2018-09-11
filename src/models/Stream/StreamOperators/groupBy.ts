import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ControlledStream } from 'src/models/Stream/ControlledStream'
import {
  DoubleInputValueTransmitterWithData,
  DoubleInputValueTransmitterWithDataSubscriptionTarget
} from 'src/models/Stream/DoubleInputValueTransmitterWithData'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
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
): IOperator<T, IGroupedStream<T, K>> {
  return new GroupByOperator<T, K>(selectKey, selectGroupDurationStream)
}

class GroupByOperator<T, K> implements IOperator<T, IGroupedStream<T, K>> {
  constructor(
    private selectKey: (value: T, index: number) => K,
    private selectGroupDurationStream?: (
      group: IGroupedStream<T, K>,
      groupInitializerValue: T,
      valuesIndex: number
    ) => Stream<unknown>
  ) {}

  public connect(
    target: ISubscriber<IGroupedStream<T, K>>,
    source: Stream<T>
  ): DisposableLike {
    return source.subscribe(
      new GroupBySubscriber<T, K>(
        target,
        this.selectKey,
        this.selectGroupDurationStream
      )
    )
  }
}

class GroupBySubscriber<T, K> extends DoubleInputValueTransmitterWithData<
  T,
  IGroupedStream<T, K>,
  unknown,
  GroupedDistributiveStream<T, K>
> {
  private groupsByKey: Map<K, GroupedDistributiveStream<T, K>> = new Map()
  private index: number = 0

  constructor(
    target: ISubscriber<IGroupedStream<T, K>>,
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
    const groupsIterator = this.groupsByKey.values()

    while (true) {
      const { done, value: group } = groupsIterator.next()

      if (done) {
        break
      }

      group.error(error)
    }

    this.destination.error(error)
  }

  private distributeCompletion(): void {
    const groupsIterator = this.groupsByKey.values()

    while (true) {
      const { done, value: group } = groupsIterator.next()

      if (done) {
        break
      }

      group.complete()
    }

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
