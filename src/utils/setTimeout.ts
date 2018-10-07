import { Disposable, IDisposable } from 'src/models/Disposable/IDisposable'
import { root } from 'src/utils/root'

export function setTimeout(callback: () => void, delay: number): IDisposable {
  const timeoutId = root.setTimeout(callback, delay)

  return new Disposable(() => clearTimeout(timeoutId))
}
