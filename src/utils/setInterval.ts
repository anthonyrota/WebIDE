import { Disposable, IDisposable } from 'src/models/Disposable/IDisposable'
import { root } from 'src/utils/root'

export function setInterval(callback: () => void, delay: number): IDisposable {
  const timeoutId = root.setInterval(callback, delay)

  return new Disposable(() => clearInterval(timeoutId))
}
