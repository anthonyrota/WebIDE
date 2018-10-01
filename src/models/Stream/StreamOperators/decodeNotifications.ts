import {
  distributeNotification,
  Notification
} from 'src/models/Stream/Notification'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function decodeNotifications<T>(): Operation<Notification<T>, T> {
  return operateThroughValueTransmitter(
    target => new DecodeNotificationsSubscriber<T>(target)
  )
}

class DecodeNotificationsSubscriber<T> extends ValueTransmitter<
  Notification<T>,
  T
> {
  protected onNextValue(notification: Notification<T>): void {
    distributeNotification(notification, this.destination)
  }
}
