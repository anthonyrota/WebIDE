import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { setTimeout } from 'src/utils/setTimeout'

export function debounceTime<T>(duration: number): IOperator<T, T> {
  return new DebounceTimeOperator<T>(duration)
}

class DebounceTimeOperator<T> implements IOperator<T, T> {
  constructor(private duration: number) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new DebounceTimeSubscriber<T>(target, this.duration)
    )
  }
}

class DebounceTimeSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private value: T | null = null
  private hasValue: boolean = false
  private delayDisposable: IDisposable | null = null

  constructor(target: ISubscriber<T>, private duration: number) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.clearDebounce()
    this.value = value
    this.hasValue = true
    this.delayDisposable = this.terminateDisposableWhenDisposed(
      setTimeout(this.distributeValue, this.duration)
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
