import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import { Stream } from 'src/models/Stream/Stream/Stream'
import { ISubscription } from 'src/models/Stream/StreamSubscription/ISubscription'

export class ConsciousStream<T> implements IConsciousDisposable {
  private __lastValue: MutableMaybe<T>
  private __rootStream: Stream<T>
  private __rootStreamSubscription: ISubscription

  constructor(
    stream: Stream<T>,
    lastValue: MutableMaybe<T> = MutableMaybe.none<T>()
  ) {
    this.__rootStream = stream
    this.__lastValue = lastValue
    this.__rootStreamSubscription = this.__rootStream.subscribe({
      onNextValue: this.__onNextValue.bind(this)
    })
  }

  public getLastValue(): MutableMaybe<T> {
    return this.__lastValue
  }

  public getRootStream(): Stream<T> {
    return this.__rootStream
  }

  public isActive(): boolean {
    return this.__rootStreamSubscription.isActive()
  }

  public dispose(): void {
    this.__rootStreamSubscription.dispose()
  }

  public disposeSelfAndStream(): void {
    this.__rootStreamSubscription.dispose()
    this.__rootStream.dispose()
  }

  private __onNextValue(value: T): void {
    this.__lastValue.setValue(value)
  }
}
