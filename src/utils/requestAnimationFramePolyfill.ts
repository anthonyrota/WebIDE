let lastTime = 0

export function requestAnimationFramePolyfill(
  callback: FrameRequestCallback
): any {
  const currTime = new Date().getTime()
  const timeToCall = Math.max(0, 16 - (currTime - lastTime))
  const id = setTimeout(() => callback(currTime + timeToCall), timeToCall)

  lastTime = currTime + timeToCall
  return id
}

export function cancelAnimationFramePolyfill(id: any): void {
  clearTimeout(id)
}
