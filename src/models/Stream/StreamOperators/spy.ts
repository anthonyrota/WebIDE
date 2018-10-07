import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { operateThroughValueTransmitter, Operation } from '../Operation'

export function spy<T>(
  secondaryTarget: ISubscriptionTarget<T>
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new SpyValueTransmitter(target, secondaryTarget)
  )
}

class SpyValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  constructor(
    target: ISubscriptionTarget<T>,
    private secondaryTarget: ISubscriptionTarget<T>
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    try {
      if (this.secondaryTarget.next) {
        this.secondaryTarget.next(value)
      }
    } catch (tapError) {
      this.destination.error(tapError)
      return
    }
    this.destination.next(value)
  }

  protected onError(error: T): void {
    try {
      if (this.secondaryTarget.error) {
        this.secondaryTarget.error(error)
      }
    } catch (tapError) {
      this.destination.error(tapError)
      return
    }
    this.destination.next(error)
  }

  protected onComplete(): void {
    try {
      if (this.secondaryTarget.complete) {
        this.secondaryTarget.complete()
      }
    } catch (tapError) {
      this.destination.error(tapError)
      return
    }
    this.destination.complete()
  }
}
