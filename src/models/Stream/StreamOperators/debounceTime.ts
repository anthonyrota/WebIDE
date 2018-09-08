import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ISubscription } from 'src/models/Disposable/Subscription'
import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { sync } from 'src/models/Scheduler/sync'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function debounceTime<T>(
  duration: number,
  scheduler: IScheduler = sync
): IOperator<T, T> {
  return new DebounceTimeOperator<T>(duration, scheduler)
}

class DebounceTimeOperator<T> implements IOperator<T, T> {
  constructor(private duration: number, private scheduler: IScheduler) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new DebounceTimeSubscriber<T>(target, this.duration, this.scheduler)
    )
  }
}

class DebounceTimeSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private value: T | null = null
  private hasValue: boolean = false
  private delaySubscription: ISubscription | null = null

  constructor(
    target: ISubscriber<T>,
    private duration: number,
    private scheduler: IScheduler
  ) {
    super(target)
  }

  private static distributeValue<T>(target: DebounceTimeSubscriber<T>): void {
    target.distributeValue()
  }

  protected onNextValue(value: T): void {
    this.clearDebounce()
    this.value = value
    this.hasValue = true
    this.delaySubscription = this.scheduler.scheduleDelayedWithData<
      DebounceTimeSubscriber<T>
    >(DebounceTimeSubscriber.distributeValue, this.duration, this)
    this.add(this.delaySubscription)
  }

  protected onComplete(): void {
    this.distributeValue()
    this.destination.complete()
  }

  private clearDebounce(): void {
    if (this.delaySubscription) {
      this.delaySubscription.dispose()
      this.delaySubscription = null
    }
  }

  private distributeValue(): void {
    this.clearDebounce()

    if (this.hasValue) {
      const value = this.value!

      this.value = null
      this.hasValue = false
      this.destination.next(value)
    }
  }
}
