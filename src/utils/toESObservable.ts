import {
  IESInteropObservable,
  IESObservable
} from 'src/models/Stream/ESObservable'
import { $$observable } from 'src/utils/observableSymbol'

export function toESObservable<T>(
  input: IESInteropObservable<T>
): IESObservable<T> {
  if (typeof input[$$observable] !== 'function') {
    throw new TypeError(
      'Provided input does not correctly implement Symbol.observable'
    )
  }

  const observable = input[$$observable]() as IESObservable<T>

  if (typeof observable.subscribe !== 'function') {
    throw new TypeError(
      'Provided input does not correctly implement Symbol.observable'
    )
  }

  return observable
}
