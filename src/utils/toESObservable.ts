import {
  IESInteropObservable,
  IESObservable
} from 'src/models/Stream/ESObservable'
import { getObservableSymbol } from 'src/utils/observableSymbol'

export function toESObservable<T>(
  input: IESInteropObservable<T>
): IESObservable<T> {
  if (typeof input[getObservableSymbol()] !== 'function') {
    throw new TypeError(
      'Provided input does not correctly implement Symbol.observable'
    )
  }

  const observable = input[getObservableSymbol()]() as IESObservable<T>

  if (typeof observable.subscribe !== 'function') {
    throw new TypeError(
      'Provided input does not correctly implement Symbol.observable'
    )
  }

  return observable
}
