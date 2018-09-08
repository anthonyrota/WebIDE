import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function fromEventPattern<T, TToken>(
  addEventListener: (callback: (value: T) => void) => TToken,
  removeEventListener: (
    callback: (value: T) => void,
    addEventListenerToken: TToken
  ) => void
): Stream<T> {
  return subscribeCallbackToEvent(callback => {
    const token = addEventListener(callback)

    return () => removeEventListener(callback, token)
  })
}

export function fromEventPatternWithMultipleArguments<T extends any[], TToken>(
  addEventListener: (callback: (...values: T) => void) => TToken,
  removeEventListener: (
    callback: (...values: T) => void,
    addEventListenerToken: TToken
  ) => void
): Stream<T> {
  return subscribeCallbackToEventWithMultipleArguments(callback => {
    const token = addEventListener(callback)

    return () => removeEventListener(callback, token)
  })
}

export function subscribeCallbackToEvent<T>(
  subscribe: (callback: (value: T) => void) => DisposableLike
): Stream<T> {
  return new RawStream<T>(target => {
    return subscribe(value => {
      target.next(value)
    })
  })
}

export function subscribeCallbackToEventWithMultipleArguments<T extends any[]>(
  subscribe: (callback: (...values: T) => void) => DisposableLike
): Stream<T> {
  return new RawStream<T>(target => {
    return subscribe((...values: T) => {
      target.next(values)
    })
  })
}
