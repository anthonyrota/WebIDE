import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Notification, NotificationType } from 'src/models/Stream/Notification'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function encodeAsNotifications<T>(): IOperator<T, Notification<T>> {
  return new EncodeAsNotificationsOperator<T>()
}

class EncodeAsNotificationsOperator<T>
  implements IOperator<T, Notification<T>> {
  public connect(
    target: ISubscriber<Notification<T>>,
    source: Stream<T>
  ): DisposableLike {
    return source.subscribe(new EncodeAsNotificationsSubscriber<T>(target))
  }
}

class EncodeAsNotificationsSubscriber<T> extends ValueTransmitter<
  T,
  Notification<T>
> {
  protected onNextValue(value: T) {
    this.destination.next({
      type: NotificationType.Next,
      value
    })
  }

  protected onError(error: any) {
    this.destination.next({
      type: NotificationType.Error,
      error
    })
    this.destination.complete()
  }

  protected onComplete() {
    this.destination.next({
      type: NotificationType.Complete
    })
    this.destination.complete()
  }
}
