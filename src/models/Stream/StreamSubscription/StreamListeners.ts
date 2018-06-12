export type OnNextValueListener<T> = (value: T) => void
export type OnErrorListener = (error: any) => void
export type OnCompleteListener = () => void
export type OnDisposeListener = () => void

export interface IStreamListeners<T> {
  onNextValue?: OnNextValueListener<T>
  onError?: OnErrorListener
  onComplete?: OnCompleteListener
  onFinish?: OnCompleteListener
}

export function isStreamListenersLike(
  value: any
): value is IStreamListeners<any> {
  return (
    typeof value === 'object' &&
    ((typeof value.onNextValue === 'function' || value.onNextValue == null) &&
      (typeof value.onError === 'function' || value.onNextValue == null) &&
      (typeof value.onComplete === 'function' || value.onNextValue == null)) &&
    (typeof value.onFinish === 'function' || value.onFinish == null)
  )
}
