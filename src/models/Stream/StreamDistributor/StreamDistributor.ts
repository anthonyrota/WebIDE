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
import {
  IStreamListeners,
  OnCompleteListener,
  OnErrorListener,
  OnNextValueListener
} from 'src/models/Stream/StreamSubscription/StreamListeners'
import { call } from 'src/utils/call'
import { callEachOnArgument } from 'src/utils/callEachOnArgument'
import { callWithArgument } from 'src/utils/callWithArgument'
import { compose2 } from 'src/utils/compose'
import { forEachObject } from 'src/utils/forEachObject'
import { ifExists } from 'src/utils/ifExists'
import { pluck } from 'src/utils/pluck'
import { pluck2 } from 'src/utils/pluck2'

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
          ifExists(callWithArgument(value)),
          pluck2('listeners', 'onNextValue')
        )
      )
    })
  }

  private __notifySubscribersOfError(error: any): void {
    this.__listenersMap.match({
      none: warnWhenOnErrorCalledAfterStreamCompleted,
      some: forEachObject(
        compose2(
          callEachOnArgument<IStreamListeners<T>>(
            compose2(ifExists(callWithArgument(error)), pluck('onError')),
            compose2(ifExists(call), pluck('onComplete'))
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
          callEachOnArgument<IStreamListeners<T>>(
            compose2(ifExists(call), pluck('onComplete')),
            compose2(ifExists(call), pluck('onFinish'))
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
        compose2(ifExists(call), pluck2('listeners', 'onFinish'))
      )
    })
  }
}
