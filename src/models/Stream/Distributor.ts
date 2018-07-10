import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

/** @todo */
export class StreamDistributor<T> extends Stream<T> {
  private __subscribers: Array<ISubscriber<T>>
  private __isActive: boolean
  private __isStopped: boolean
}
