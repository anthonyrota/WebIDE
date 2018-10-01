import {
  createCompleteNotification,
  createErrorNotification,
  createNextNotification,
  Notification
} from 'src/models/Stream/Notification'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function encodeAsNotifications<T>(): Operation<T, Notification<T>> {
  return operateThroughValueTransmitter(
    target => new EncodeAsNotificationsValueTransmitter(target)
  )
}

class EncodeAsNotificationsValueTransmitter<T> extends ValueTransmitter<
  T,
  Notification<T>
> {
  protected onNextValue(value: T) {
    this.destination.next(createNextNotification(value))
  }

  protected onError(error: any) {
    this.destination.next(createErrorNotification(error))
    this.destination.complete()
  }

  protected onComplete() {
    this.destination.next(createCompleteNotification())
    this.destination.complete()
  }
}
