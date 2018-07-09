import { freeze } from 'src/utils/freeze'
import { noop } from 'src/utils/noop'

export const emptySubscriber: IRequiredStreamSubscriber<any> = freeze({
  next: noop,
  error: noop,
  complete: noop
})

export type OnNextValueListener<T> = (value: T) => void
export type OnErrorListener = (error: any) => void
export type OnCompleteListener = () => void
export type OnDisposeListener = () => void

export interface IRequiredStreamSubscriber<T> {
  next: OnNextValueListener<T>
  error: OnErrorListener
  complete: OnCompleteListener
}

export interface IStreamSubscriber<T> {
  next?: OnNextValueListener<T>
  error?: OnErrorListener
  complete?: OnCompleteListener
}

export function isStreamSubscriber(
  value: any
): value is IStreamSubscriber<any> {
  return (
    value &&
    (typeof value.next === 'function' || value.next == null) &&
    (typeof value.error === 'function' || value.next == null) &&
    (typeof value.complete === 'function' || value.next == null)
  )
}

export function isRequiredStreamSubscriber(
  value: any
): value is IRequiredStreamSubscriber<any> {
  return (
    value &&
    typeof value.next === 'function' &&
    typeof value.error === 'function' &&
    typeof value.complete === 'function'
  )
}
