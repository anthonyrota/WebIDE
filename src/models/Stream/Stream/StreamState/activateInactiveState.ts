import {
  IStreamActivatedState,
  IStreamInactivatedState
} from 'src/models/Stream/Stream/StreamState/StreamState'
import { StreamDistributor } from 'src/models/Stream/StreamDistributor/StreamDistributor'
import { StreamSource } from 'src/models/Stream/StreamSource/StreamSource'

export function activateInactiveState<T>({
  initiate
}: IStreamInactivatedState<T>): IStreamActivatedState<T> {
  const distributor = new StreamDistributor<T>()
  const source = new StreamSource<T>(distributor)
  const onDispose = initiate(source)

  return {
    distributor,
    isActivated: true,
    onDispose,
    source
  }
}
