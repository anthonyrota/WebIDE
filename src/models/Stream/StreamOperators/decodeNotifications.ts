import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import {
  distributeNotification,
  Notification
} from 'src/models/Stream/Notification'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function decodeNotifications<T>(): IOperator<Notification<T>, T> {
  return new DecodeNotificationsOperator<T>()
}

class DecodeNotificationsOperator<T> implements IOperator<Notification<T>, T> {
  public connect(
    target: ISubscriber<T>,
    source: Stream<Notification<T>>
  ): DisposableLike {
    return source.subscribe(new DecodeNotificationsSubscriber<T>(target))
  }
}

class DecodeNotificationsSubscriber<T> extends ValueTransmitter<
  Notification<T>,
  T
> {
  protected onNextValue(notification: Notification<T>): void {
    distributeNotification(notification, this.destination)
  }
}
