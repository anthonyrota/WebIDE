import { ISubscriber } from 'src/models/Stream/ISubscriber'

export enum NotificationType {
  Value,
  Error,
  Complete
}

export type Notification<T> =
  | { type: NotificationType.Value; value: T }
  | { type: NotificationType.Error; error: unknown }
  | { type: NotificationType.Complete }

export function createValueNotification<T>(value: T): Notification<T> {
  return { type: NotificationType.Value, value }
}

export function createErrorNotification<T>(error: unknown): Notification<T> {
  return { type: NotificationType.Error, error }
}

export function createCompleteNotification<T>(): Notification<T> {
  return { type: NotificationType.Complete }
}

export function distributeNotification<T>(
  notification: Notification<T>,
  target: ISubscriber<T>
): void {
  if (notification.type === NotificationType.Value) {
    if (target.next) {
      target.next(notification.value)
    }
  } else if (notification.type === NotificationType.Error) {
    if (target.error) {
      target.error(notification.error)
    }
  } else {
    if (target.complete) {
      target.complete()
    }
  }
}
