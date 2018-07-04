import { ISubscription } from 'src/models/Stream/StreamSubscription/ISubscription'
import { ISubscriptionMap } from 'src/models/Stream/StreamSubscription/ISubscriptionMap'
import { IStreamListeners } from 'src/models/Stream/StreamSubscription/StreamListeners'

export class ActiveSubscription<T> implements ISubscription {
  private __isActive: boolean
  private __listeners: IStreamListeners<T>
  private __subscriptionMap: ISubscriptionMap<T>
  private __id: number

  constructor(
    listeners: IStreamListeners<T>,
    subscriptionMap: ISubscriptionMap<T>,
    id: number
  ) {
    this.__listeners = listeners
    this.__subscriptionMap = subscriptionMap
    this.__id = id
    this.__subscriptionMap[this.__id] = {
      listeners: this.__listeners,
      subscription: this
    }
  }

  public dispose(): void {
    if (this.__isActive) {
      delete this.__subscriptionMap[this.__id]
    }
  }

  public isActive(): boolean {
    return this.__isActive
  }

  public toString(): string {
    return `ActiveStreamSubscription(id=${this.__id}, isActive=${
      this.__isActive
    })`
  }
}
