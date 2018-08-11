import { ISubscription } from 'src/models/Disposable/Subscription'
import { freeze } from 'src/utils/freeze'
import { noop } from 'src/utils/noop'

export const emptySubscriber: IRequiredSubscriber<any> = freeze({
  next: noop,
  error: noop,
  complete: noop
})

export type OnNextValueListener<T> = (value: T) => void
export type OnErrorListener = (error: unknown) => void
export type OnCompleteListener = () => void
export type OnDisposeListener = () => void

export interface IRequiredSubscriber<T> {
  next: OnNextValueListener<T>
  error: OnErrorListener
  complete: OnCompleteListener
}

export interface ISubscriber<T> {
  next?: OnNextValueListener<T>
  error?: OnErrorListener
  complete?: OnCompleteListener
}

export interface ISubscribable<T> {
  subscribe(subscriber: ISubscriber<T>): ISubscription
}

export function isSubscriber(value: any): value is ISubscriber<unknown> {
  return (
    value != null &&
    (typeof value.next === 'function' || value.next == null) &&
    (typeof value.error === 'function' || value.next == null) &&
    (typeof value.complete === 'function' || value.next == null)
  )
}

export function isRequiredSubscriber(
  value: any
): value is IRequiredSubscriber<unknown> {
  return (
    value !== null &&
    typeof value.next === 'function' &&
    typeof value.error === 'function' &&
    typeof value.complete === 'function'
  )
}
