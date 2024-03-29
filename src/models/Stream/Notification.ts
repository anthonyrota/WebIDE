import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'

export const enum NotificationType {
  Next,
  Error,
  Complete
}

export type Notification<T> =
  | { type: NotificationType.Next; value: T }
  | { type: NotificationType.Error; error: unknown }
  | { type: NotificationType.Complete }

export function createNextNotification<T>(value: T): Notification<T> {
  return { type: NotificationType.Next, value }
}

export function createErrorNotification<T>(error: unknown): Notification<T> {
  return { type: NotificationType.Error, error }
}

export function createCompleteNotification<T>(): Notification<T> {
  return { type: NotificationType.Complete }
}

export function distributeNotification<T>(
  notification: Notification<T>,
  target: ISubscriptionTarget<T>
): void {
  if (notification.type === NotificationType.Next) {
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
