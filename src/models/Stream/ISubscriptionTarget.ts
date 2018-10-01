import { ISubscription } from 'src/models/Disposable/Subscription'
import { freeze } from 'src/utils/freeze'
import { noop } from 'src/utils/noop'

export const emptySubscriber: IRequiredSubscriptionTarget<any> = freeze({
  next: noop,
  error: noop,
  complete: noop
})

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
  subscribe(subscriber: ISubscriptionTarget<T>): ISubscription
}

export function isSubscriptionTarget(
  value: any
): value is ISubscriptionTarget<unknown> {
  return (
    value != null &&
    (typeof value.next === 'function' || value.next == null) &&
    (typeof value.error === 'function' || value.next == null) &&
    (typeof value.complete === 'function' || value.next == null)
  )
}
