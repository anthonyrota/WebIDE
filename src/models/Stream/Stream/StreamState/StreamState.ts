import { IDisposable } from 'src/models/Disposable/IDisposable'
import { StreamDistributor } from 'src/models/Stream/StreamDistributor/StreamDistributor'
import { StreamSource } from 'src/models/Stream/StreamSource/StreamSource'

export interface IStreamActivatedState<T> {
  isActivated: true
  distributor: StreamDistributor<T>
  source: StreamSource<T>
  onDispose?: () => void | IDisposable
}

export interface IStreamInactivatedState<T> {
  isActivated: false
  initiate: (source: StreamSource<T>) => (() => void) | IDisposable | void
}
