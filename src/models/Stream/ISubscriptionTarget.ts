import { ISubscription } from 'src/models/Disposable/Subscription'
import { isCallable } from 'src/utils/isCallable'

export type OnNextValueListener<T> = (value: T) => void
export type OnErrorListener = (error: unknown) => void
export type OnCompleteListener = () => void
export type OnDisposeListener = () => void

export interface IRequiredSubscriptionTarget<T> {
  next: OnNextValueListener<T>
  error: OnErrorListener
  complete: OnCompleteListener
}

export interface ISubscriptionTarget<T> {
  next?: OnNextValueListener<T>
  error?: OnErrorListener
  complete?: OnCompleteListener
}

export interface ISubscribable<T> {
  subscribe(target: ISubscriptionTarget<T>): ISubscription
}

export function isSubscriptionTarget(
  value: any
): value is ISubscriptionTarget<unknown> {
  return (
    value != null &&
    (isCallable(value.next) || value.next == null) &&
    (isCallable(value.error) || value.next == null) &&
    (isCallable(value.complete) || value.next == null)
  )
}
