import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { freeze } from 'src/utils/freeze'

export const emptyDisposable: Readonly<IConsciousDisposable> = freeze({
  dispose(): void {},
  isActive(): boolean {
    return false
  }
})
