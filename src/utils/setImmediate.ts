import { Disposable } from 'src/models/Disposable/Disposable'
import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { root } from 'src/utils/root'
import {
  clearImmediatePolyfill,
  setImmediatePolyfill
} from 'src/utils/setImmediatePolyfill'

let nativeSetImmediate: (callback: () => void) => any
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

class SetImmediateDisposable extends Disposable {
  private __id: any

  constructor(id: any) {
    super()
    this.__id = id
  }

  protected _afterDisposed(): void {
    nativeClearImmediate(this.__id)
  }
}

export function setImmediate(callback: () => void): IConsciousDisposable {
  const id = nativeSetImmediate(callback)
  return new SetImmediateDisposable(id)
}
