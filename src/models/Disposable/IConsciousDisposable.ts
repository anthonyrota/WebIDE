import { IDisposable } from 'src/models/Disposable/IDisposable'

export interface IConsciousDisposable extends IDisposable {
  isActive(): boolean
}
