import { IDisposable } from 'src/models/Disposable/IDisposable'
import {
  cancelAnimationFramePolyfill,
  requestAnimationFramePolyfill
} from 'src/utils/requestAnimationFramePolyfill'
import { root } from 'src/utils/root'

const nativeRequestAnimationFrame: (callback: FrameRequestCallback) => unknown =
  root.requestAnimationFrame ||
  root.msRequestAnimationFrame ||
  root.mozRequestAnimationFrame ||
  root.webkitRequestAnimationFrame ||
  root.oRequestAnimationFrame ||
  requestAnimationFramePolyfill

const nativeCancelAnimationFrame: (id: unknown) => void =
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
): IDisposable {
  const animationId = nativeRequestAnimationFrame(callback)

  return new RequestAnimationFrameDisposable(animationId)
}

class RequestAnimationFrameDisposable implements IDisposable {
  constructor(private animationId: unknown) {}

  public dispose(): void {
    nativeCancelAnimationFrame(this.animationId)
  }
}
