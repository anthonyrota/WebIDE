import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IDisposable } from 'src/models/Disposable/IDisposable'
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
  private delayDisposable: IDisposable | null = null

  constructor(
    target: ISubscriber<T>,
    private duration: number,
    private scheduler: IScheduler
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.clearDebounce()
    this.value = value
    this.hasValue = true
    this.delayDisposable = this.terminateDisposableWhenDisposed(
      this.scheduler.scheduleDelayedWithData<DebounceTimeSubscriber<T>>(
        this.distributeValue,
        this,
        this.duration
      )
    )
  }

  protected onComplete(): void {
    this.distributeValue()
    this.destination.complete()
  }

  private clearDebounce(): void {
    if (this.delayDisposable) {
      this.delayDisposable.dispose()
      this.delayDisposable = null
    }
  }

  private distributeValue(self: DebounceTimeSubscriber<T> = this): void {
    self.clearDebounce()

    if (self.hasValue) {
      const value = self.value!

      self.value = null
      self.hasValue = false
      self.destination.next(value)
    }
  }
}
