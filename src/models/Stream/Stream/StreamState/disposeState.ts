import { isDisposable } from 'src/models/Disposable/isDisposable'
import {
  IStreamActivatedState,
  IStreamInactivatedState
} from 'src/models/Stream/Stream/StreamState/StreamState'

export function disposeState<T>(
  state: IStreamActivatedState<T> | IStreamInactivatedState<T>
): void {
  if (state.isActivated) {
    state.distributor.onComplete()
    if (state.onDispose) {
      if (isDisposable(state.onDispose)) {
        state.onDispose.dispose()
      } else {
        state.onDispose()
      }
    }
  }
}
