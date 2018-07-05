export type OnNextValueListener<T> = (value: T) => void
export type OnErrorListener = (error: any) => void
export type OnCompleteListener = () => void
export type OnDisposeListener = () => void

export interface IStreamSubscriber<T> {
  onNextValue?: OnNextValueListener<T>
  onError?: OnErrorListener
  onComplete?: OnCompleteListener
}

export interface IRequiredStreamSubscriber<T> {
  onNextValue: OnNextValueListener<T>
  onError: OnErrorListener
  onComplete: OnCompleteListener
}

export function isStreamSubscriber(
  value: any
): value is IStreamSubscriber<any> {
  return (
    value &&
    (typeof value.onNextValue === 'function' || value.onNextValue == null) &&
    (typeof value.onError === 'function' || value.onNextValue == null) &&
    (typeof value.onComplete === 'function' || value.onNextValue == null)
  )
}

export function isRequiredStreamSubscriber(
  value: any
): value is IRequiredStreamSubscriber<any> {
  return (
    value &&
    typeof value.onNextValue === 'function' &&
    typeof value.onError === 'function' &&
    typeof value.onComplete === 'function'
  )
}
