import { IDisposable } from 'src/models/Disposable/IDisposable'
import { ISubscription, Subscription } from 'src/models/Disposable/Subscription'
import {
  cancelAnimationFramePolyfill,
  requestAnimationFramePolyfill
} from 'src/utils/requestAnimationFramePolyfill'
import { root } from 'src/utils/root'

const nativeRequestAnimationFrame: (callback: FrameRequestCallback) => any =
  root.requestAnimationFrame ||
  root.msRequestAnimationFrame ||
  root.mozRequestAnimationFrame ||
  root.webkitRequestAnimationFrame ||
  root.oRequestAnimationFrame ||
  requestAnimationFramePolyfill

const nativeCancelAnimationFrame: (id: any) => void =
  root.cancelAnimationFrame ||
  root.msCancelAnimationFrame ||
  root.mozCancelAnimationFrame ||
  root.webkitCancelAnimationFrame ||
  root.oCancelAnimationFrame ||
  root.msCancelRequestAnimationFrame ||
  root.mozCancelRequestAnimationFrame ||
  root.webkitCancelRequestAnimationFrame ||
  root.oCancelRequestAnimationFrame ||
  cancelAnimationFramePolyfill

export function requestAnimationFrame(
  callback: FrameRequestCallback
): ISubscription {
  const animationId = nativeRequestAnimationFrame(callback)

  return Subscription.fromDisposable(
    new RequestAnimationFrameDisposable(animationId)
  )
}

class RequestAnimationFrameDisposable implements IDisposable {
  constructor(private animationId: any) {}

  public dispose(): void {
    nativeCancelAnimationFrame(this.animationId)
  }
}
