import { IESInteropObservable } from 'src/models/Stream/ESObservable'

export function isESInteropObservable(
  value: any
): value is IESInteropObservable<unknown> {
  return value != null && typeof value[Symbol.observable] === 'function'
}

declare global {
  // tslint:disable-next-line:interface-name
  interface SymbolConstructor {
    readonly observable: symbol
  }
}
