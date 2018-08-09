import { IDisposable } from 'src/models/Disposable/IDisposable'
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

class SetImmediateDisposable implements IDisposable {
  constructor(private id: any) {}

  public dispose(): void {
    nativeClearImmediate(this.id)
  }
}

export function setImmediate(callback: () => void): IDisposable {
  const id = nativeSetImmediate(callback)
  return new SetImmediateDisposable(id)
}
