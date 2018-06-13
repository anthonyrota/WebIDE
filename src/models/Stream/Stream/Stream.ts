import { IDisposable } from 'src/models/Disposable/IDisposable'
import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import { activateStateIfInactive } from 'src/models/Stream/Stream/StreamState/activateStateIfInactive'
import { disposeState } from 'src/models/Stream/Stream/StreamState/disposeState'
import {
  IStreamActivatedState,
  IStreamInactivatedState
} from 'src/models/Stream/Stream/StreamState/StreamState'
import { subscribeToListeners } from 'src/models/Stream/Stream/StreamState/subscribeToListeners'
import { StreamDistributor } from 'src/models/Stream/StreamDistributor/StreamDistributor'
import {
  isStreamSource,
  StreamSource
} from 'src/models/Stream/StreamSource/StreamSource'
import { createInactiveSubscription } from 'src/models/Stream/StreamSubscription/createInactiveStreamSubscription'
import { ISubscription } from 'src/models/Stream/StreamSubscription/ISubscription'
import {
  IStreamListeners,
  OnNextValueListener
} from 'src/models/Stream/StreamSubscription/StreamListeners'

export class Stream<T> implements IDisposable {
  private __state: MutableMaybe<
    IStreamActivatedState<T> | IStreamInactivatedState<T>
  >

  constructor(source: StreamSource<T>, distributor: StreamDistributor<T>)
  constructor(
    subscribeFunction: (
      source: StreamSource<T>
    ) => (() => void) | IDisposable | void
  )
  constructor(
    sourceOrSubscribeFunction:
      | StreamSource<T>
      | ((source: StreamSource<T>) => (() => void) | IDisposable | void),
    distributor?: StreamDistributor<T>
  ) {
    this.__state = isStreamSource(sourceOrSubscribeFunction)
      ? MutableMaybe.some<IStreamActivatedState<T>>({
          distributor: distributor as StreamDistributor<T>,
          isActivated: true,
          source: sourceOrSubscribeFunction
        })
      : MutableMaybe.some<IStreamInactivatedState<T>>({
          initiate: sourceOrSubscribeFunction,
          isActivated: false
        })
  }

  public subscribeToSourceWithOnNextValueListener(
    source: StreamSource<any>,
    onNextValue: OnNextValueListener<T>
  ): ISubscription {
    return this.subscribe({
      onComplete: source.complete,
      onError: source.error,
      onNextValue
    })
  }

  public subscribeToSourceWithListeners(
    source: StreamSource<any>,
    listeners: IStreamListeners<T> & { onNextValue: (value: T) => void }
  ): ISubscription
  public subscribeToSourceWithListeners(
    source: StreamSource<T>,
    listeners: IStreamListeners<T>
  ): ISubscription
  public subscribeToSourceWithListeners(
    source: StreamSource<T>,
    listeners: IStreamListeners<T>
  ): ISubscription {
    return this.subscribe({
      onComplete: listeners.onComplete || source.complete,
      onError: listeners.onError || source.error,
      onFinish: listeners.onFinish,
      onNextValue: listeners.onNextValue || source.next
    })
  }

  public subscribeToSource(source: StreamSource<T>): ISubscription {
    return this.subscribe({
      onComplete: source.complete,
      onError: source.error,
      onNextValue: source.next
    })
  }

  public subscribeWithOnNextValueListener(
    onNextValue: (value: T) => void
  ): ISubscription {
    return this.subscribe({ onNextValue })
  }

  public subscribeWithOnErrorListener(
    onError: (value: T) => void
  ): ISubscription {
    return this.subscribe({ onError })
  }

  public subscribeWithOnCompleteListener(
    onComplete: () => void
  ): ISubscription {
    return this.subscribe({ onComplete })
  }

  public subscribeWithOnFinishListener(onFinish: () => void): ISubscription {
    return this.subscribe({ onFinish })
  }

  public subscribe(listeners: IStreamListeners<T>): ISubscription {
    return this.__state.transform(activateStateIfInactive).match({
      none: createInactiveSubscription,
      some: subscribeToListeners(listeners)
    })
  }

  public dispose(): void {
    this.__state.mutate(disposeState).empty()
  }

  public isActive(): boolean {
    return this.__state.hasValue()
  }
}
