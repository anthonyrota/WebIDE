import {
  IESInteropObservable,
  IESObservable
} from 'src/models/Stream/ESObservable'

export function toESObservable<T>(
  input: IESInteropObservable<T>
): IESObservable<T> {
  if (typeof input[Symbol.observable] !== 'function') {
    throw new TypeError(
      'Provided input does not correctly implement Symbol.observable'
    )
  }

  const observable = input[Symbol.observable]() as IESObservable<T>

  if (typeof observable.subscribe !== 'function') {
    throw new TypeError(
      'Provided input does not correctly implement Symbol.observable'
    )
  }

  return observable
}
