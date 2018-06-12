import {
  IStreamActivatedState,
  IStreamInactivatedState
} from 'src/models/Stream/Stream/StreamState/StreamState'
import { createInactiveSubscription } from 'src/models/Stream/StreamSubscription/createInactiveStreamSubscription'
import { ISubscription } from 'src/models/Stream/StreamSubscription/ISubscription'
import { IStreamListeners } from 'src/models/Stream/StreamSubscription/StreamListeners'
import { curry2 } from 'src/utils/curry'

export const subscribeToListeners: {
  <T>(listeners: IStreamListeners<T>): (
    state: IStreamActivatedState<T> | IStreamInactivatedState<T>
  ) => ISubscription
  <T>(
    listeners: IStreamListeners<T>,
    state: IStreamActivatedState<T> | IStreamInactivatedState<T>
  ): ISubscription
} = curry2(
  <T>(
    listeners: IStreamListeners<T>,
    state: IStreamActivatedState<T> | IStreamInactivatedState<T>
  ): ISubscription => {
    return state.isActivated
      ? state.distributor.subscribe(listeners)
      : createInactiveSubscription()
  }
)
