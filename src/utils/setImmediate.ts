import { IDisposable } from 'src/models/Disposable/IDisposable'
import { ISubscription, Subscription } from 'src/models/Disposable/Subscription'
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

class SetImmediateDisposable implements IDisposable {
  constructor(private id: any) {}

  public dispose(): void {
    nativeClearImmediate(this.id)
  }
}

export function setImmediate(callback: () => void): ISubscription {
  const id = nativeSetImmediate(callback)
  return Subscription.fromDisposable(new SetImmediateDisposable(id))
}
