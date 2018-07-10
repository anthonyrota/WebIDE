import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { freeze } from 'src/utils/freeze'
import { noop } from 'src/utils/noop'

export const emptySubscriber: IRequiredSubscriber<any> = freeze({
  next: noop,
  error: noop,
  complete: noop
})

export type OnNextValueListener<T> = (value: T) => void
export type OnErrorListener = (error: any) => void
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
  subscribe(subscriber: ISubscriber<T>): IConsciousDisposable
}

export function isSubscriber(value: any): value is ISubscriber<any> {
  return (
    value &&
    (typeof value.next === 'function' || value.next == null) &&
    (typeof value.error === 'function' || value.next == null) &&
    (typeof value.complete === 'function' || value.next == null)
  )
}

export function isRequiredSubscriber(
  value: any
): value is IRequiredSubscriber<any> {
  return (
    value &&
    typeof value.next === 'function' &&
    typeof value.error === 'function' &&
    typeof value.complete === 'function'
  )
}
