import { IESInteropObservable } from 'src/models/Stream/ESObservable'
import { $$observable } from 'src/utils/observableSymbol'

export function isESInteropObservable(
  value: any
): value is IESInteropObservable<any> {
  return !!value && typeof value[$$observable] === 'function'
}
