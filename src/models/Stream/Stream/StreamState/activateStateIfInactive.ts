import { activateInactiveState } from 'src/models/Stream/Stream/StreamState/activateInactiveState'
import {
  IStreamActivatedState,
  IStreamInactivatedState
} from 'src/models/Stream/Stream/StreamState/StreamState'

export function activateStateIfInactive<T>(
  state: IStreamActivatedState<T> | IStreamInactivatedState<T>
): IStreamActivatedState<T> {
  return state.isActivated ? state : activateInactiveState(state)
}
