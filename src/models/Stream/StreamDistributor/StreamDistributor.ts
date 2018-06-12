import { IDisposable } from 'src/models/Disposable/IDisposable'
import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import {
  warnWhenDisposeCalledAfterStreamCompleted,
  warnWhenOnErrorCalledAfterStreamCompleted,
  warnWhenOnNextValueCalledAfterStreamCompleted
} from 'src/models/Stream/StreamDistributor/StreamDistributorWarnings'
import { createActiveSubscription } from 'src/models/Stream/StreamSubscription/createActiveSubscription'
import { createInactiveSubscription } from 'src/models/Stream/StreamSubscription/createInactiveStreamSubscription'
import { ISubscription } from 'src/models/Stream/StreamSubscription/ISubscription'
import { ISubscriptionMap } from 'src/models/Stream/StreamSubscription/ISubscriptionMap'
import { IStreamListeners } from 'src/models/Stream/StreamSubscription/StreamListeners'
import { callEachOnArgument } from 'src/utils/callEachOnArgument'
import { callMethodIfExists } from 'src/utils/callMethodIfExists'
import { callMethodWithArgumentIfExists } from 'src/utils/callMethodWithArgumentIfExists'
import { compose2 } from 'src/utils/compose'
import { forEachObject } from 'src/utils/forEachObject'
import { pluck } from 'src/utils/pluck'

export class StreamDistributor<T> implements IDisposable {
  private __listenersMap = MutableMaybe.some({} as ISubscriptionMap<T>)

  public subscribe(streamListeners: IStreamListeners<T>): ISubscription {
    return this.__listenersMap.match({
      none: createInactiveSubscription,
      some: createActiveSubscription<T>(streamListeners)
    })
  }

  public onNextValue(value: T): void {
    try {
      this.__notifySubscribersOfValue(value)
    } catch (error) {
      this.__reportError(error)
    }
  }

  public onError(error: any): void {
    try {
      this.__notifySubscribersOfError(error)
    } catch (error) {
      this.__reportError(error)
    }
  }

  public onComplete(): void {
    try {
      this.__notifySubscribersOfCompletion()
    } catch (error) {
      this.__reportError(error)
    }
  }

  public dispose(): void {
    this.__signalDisposal()
    this.__emptyListenersMap()
  }

  private __notifySubscribersOfValue(value: T): void {
    this.__listenersMap.match({
      none: warnWhenOnNextValueCalledAfterStreamCompleted,
      some: forEachObject(
        compose2(
          callMethodWithArgumentIfExists('onNextValue', value),
          pluck('listeners')
        )
      )
    })
  }

  private __notifySubscribersOfError(error: any): void {
    this.__listenersMap.match({
      none: warnWhenOnErrorCalledAfterStreamCompleted,
      some: forEachObject(
        compose2(
          callEachOnArgument(
            callMethodWithArgumentIfExists('onError', error),
            callMethodIfExists('onFinish')
          ),
          pluck('listeners')
        )
      )
    })
    this.__emptyListenersMap()
  }

  private __notifySubscribersOfCompletion(): void {
    this.__listenersMap.match({
      none: warnWhenOnErrorCalledAfterStreamCompleted,
      some: forEachObject(
        compose2(
          callEachOnArgument(
            callMethodIfExists('onComplete'),
            callMethodIfExists('onFinish')
          ),
          pluck('listeners')
        )
      )
    })
    this.__emptyListenersMap()
  }

  private __reportError(error: any): void {
    setTimeout(() => {
      throw error
    })
  }

  private __emptyListenersMap(): void {
    this.__listenersMap.empty()
  }

  private __signalDisposal(): void {
    this.__listenersMap.match({
      none: warnWhenDisposeCalledAfterStreamCompleted,
      some: forEachObject(
        compose2(callMethodIfExists('onFinish'), pluck('listeners'))
      )
    })
  }
}
