import { IESInteropObservable } from 'src/models/Stream/ESObservable'
import { isFunction } from 'util'

export function isESInteropObservable(
  value: any
): value is IESInteropObservable<unknown> {
  return value != null && isFunction(value[Symbol.observable])
}

declare global {
  // tslint:disable-next-line:interface-name
  interface SymbolConstructor {
    readonly observable: symbol
  }
}
