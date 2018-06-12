import { IDisposable } from 'src/models/Disposable/IDisposable'

export interface ISubscription extends IDisposable {
  dispose(): void
  isActive(): boolean
}
