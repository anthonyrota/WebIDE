import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { ControlledStream } from 'src/models/Stream/ControlledStream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { MutableMaybe } from '../Maybe/MutableMaybe'

export class DelayedUntilCompletionControlledStream<T> extends ControlledStream<
  T
> {
  private __mutableValue: MutableMaybe<T> = MutableMaybe.none()

  public onNextValue(value: T): void {
    this.__mutableValue.setAs(value)
  }

  public onComplete(): void {
    this.__mutableValue.withValue(value => {
      super.next(value)
    })

    super.complete()
  }

  public trySubscribe(target: ValueTransmitter<T, unknown>): DisposableLike {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.getError().withValue(error => {
      throw error
    })

    if (this.isReceivingValues()) {
      return super.pushTarget(target)
    }

    this.__mutableValue.withValue(value => {
      target.next(value)
    })

    target.complete()
  }
}
