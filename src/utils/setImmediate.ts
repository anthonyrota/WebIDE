import { Disposable, IDisposable } from 'src/models/Disposable/IDisposable'
import { root } from 'src/utils/root'
import {
  clearImmediatePolyfill,
  setImmediatePolyfill
} from 'src/utils/setImmediatePolyfill'

let nativeSetImmediate: (callback: () => void) => unknown
let nativeClearImmediate: (id: any) => void

if (
  typeof root.setImmediate !== 'undefined' &&
  typeof root.clearImmediate !== 'undefined'
) {
  nativeSetImmediate = root.setImmediate
  nativeClearImmediate = root.clearImmediate
} else {
  nativeSetImmediate = setImmediatePolyfill
  nativeClearImmediate = clearImmediatePolyfill
}

export function setImmediate(callback: () => void): IDisposable {
  const id = nativeSetImmediate(callback)
  return new Disposable(() => nativeClearImmediate(id))
}
