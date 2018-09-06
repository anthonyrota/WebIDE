import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export interface INodeLikeEventEmitter<TEventName, TValue> {
  addListener(eventName: TEventName, callback: (value: TValue) => void): unknown
  removeListener(
    eventName: TEventName,
    callback: (value: TValue) => void
  ): unknown
}

export interface INodeLikeEventEmitterWithMultipleValues<
  TEventName,
  TValues extends any[]
> {
  addListener(
    eventName: TEventName,
    callback: (...values: TValues) => void
  ): unknown
  removeListener(
    eventName: TEventName,
    callback: (...values: TValues) => void
  ): unknown
}

export function fromNodeLikeEmitterEvent<TEventName, TValue>(
  emitter: INodeLikeEventEmitter<TEventName, TValue>,
  eventName: TEventName
): Stream<TValue> {
  return fromEventPattern(
    callback => emitter.addListener(eventName, callback),
    callback => emitter.removeListener(eventName, callback)
  )
}

export function fromNodeLikeEmitterEventWithMultipleValues<
  TEventName,
  TValues extends any[]
>(
  emitter: INodeLikeEventEmitterWithMultipleValues<TEventName, TValues>,
  eventName: TEventName
): Stream<TValues> {
  return fromEventPatternWithMultipleArguments(
    callback => emitter.addListener(eventName, callback),
    callback => emitter.removeListener(eventName, callback)
  )
}

export interface IOnOffEventEmitter<TEventName, TValue> {
  on(eventName: TEventName, callback: (value: TValue) => void): unknown
  off(eventName: TEventName, callback: (value: TValue) => void): unknown
}

export interface IOnOffEventEmitterWithMultipleValues<
  TEventName,
  TValues extends any[]
> {
  on(eventName: TEventName, callback: (...values: TValues) => void): unknown
  off(eventName: TEventName, callback: (...values: TValues) => void): unknown
}

export function fromOnOffEmitterEvent<TEventName, TValue>(
  emitter: IOnOffEventEmitter<TEventName, TValue>,
  eventName: TEventName
): Stream<TValue> {
  return fromEventPattern(
    callback => emitter.on(eventName, callback),
    callback => emitter.off(eventName, callback)
  )
}

export function fromOnOffEmitterEventWithMultipleValues<
  TEventName,
  TValues extends any[]
>(
  emitter: IOnOffEventEmitterWithMultipleValues<TEventName, TValues>,
  eventName: TEventName
): Stream<TValues> {
  return fromEventPatternWithMultipleArguments(
    callback => emitter.on(eventName, callback),
    callback => emitter.off(eventName, callback)
  )
}

export interface IEventListenerOptions {
  capture?: boolean
  passive?: boolean
  once?: boolean
}

export interface IEventTargetLike<TEventName, TValue> {
  addEventListener(
    eventName: TEventName,
    callback: (value: TValue) => void,
    options?: boolean | IEventListenerOptions
  ): unknown
  removeEventListener(
    eventName: TEventName,
    callback: (value: TValue) => void,
    options?: boolean | IEventListenerOptions
  ): unknown
}

export interface IEventTargetLikeWithMultipleValues<
  TEventName,
  TValues extends any[]
> {
  addEventListener(
    eventName: TEventName,
    callback: (...values: TValues) => void,
    options?: boolean | IEventListenerOptions
  ): unknown
  removeEventListener(
    eventName: TEventName,
    callback: (...values: TValues) => void,
    options?: boolean | IEventListenerOptions
  ): unknown
}

export interface IEventTargetLikeListenerOptions {
  capture?: boolean
  passive?: boolean
  once?: boolean
}

export function fromEventTargetLikeEvent<TEventName, TValue>(
  emitter: IEventTargetLike<TEventName, TValue>,
  eventName: TEventName,
  options?: IEventTargetLikeListenerOptions
): Stream<TValue> {
  return fromEventPattern(
    callback => emitter.addEventListener(eventName, callback, options),
    callback => emitter.removeEventListener(eventName, callback, options)
  )
}

export function fromEventTargetLikeEventWithMultipleValues<
  TEventName,
  TValues extends any[]
>(
  emitter: IEventTargetLikeWithMultipleValues<TEventName, TValues>,
  eventName: TEventName,
  options?: IEventTargetLikeListenerOptions
): Stream<TValues> {
  return fromEventPatternWithMultipleArguments(
    callback => emitter.addEventListener(eventName, callback, options),
    callback => emitter.removeEventListener(eventName, callback, options)
  )
}

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
