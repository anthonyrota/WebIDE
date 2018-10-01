import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import {
  isSubscriptionPropertyKey,
  ISubscription,
  Subscription
} from 'src/models/Disposable/Subscription'
import { IControlledStream } from 'src/models/Stream/ControlledStream'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { Stream } from 'src/models/Stream/Stream'

export class SharedStream<T> extends Stream<T> implements ISubscription {
  public readonly [isSubscriptionPropertyKey] = true
  private __sharedControlledStream: IControlledStream<T, T> | null = null
  private __source: Stream<T>
  private __createControlledStream: () => IControlledStream<T, T>
  private __selfSubscription: ISubscription = new Subscription()
  private __isSourceActivated: boolean = false

  constructor(
    source: Stream<T>,
    createControlledStream: () => IControlledStream<T, T>
  ) {
    super()
    this.__source = source
    this.__createControlledStream = createControlledStream
  }

  public addOnDispose(disposableLike: DisposableLike): void {
    this.__selfSubscription.addOnDispose(disposableLike)
  }

  public removeOnDispose(disposableLike: DisposableLike): void {
    this.__selfSubscription.removeOnDispose(disposableLike)
  }

  public isActive(): boolean {
    return this.__selfSubscription.isActive()
  }

  public dispose(): void {
    this.__selfSubscription.dispose()
  }

  public activateSource(): void {
    if (this.isActive() && !this.__isSourceActivated) {
      this.__isSourceActivated = true
      this.__source.subscribe(this.createSharedControlledStream())
    }
  }

  protected trySubscribe(target: ISubscriptionTarget<T>): DisposableLike {
    return this.createSharedControlledStream().subscribe(target)
  }

  private createSharedControlledStream(): IControlledStream<T, T> {
    if (!this.__sharedControlledStream) {
      this.__sharedControlledStream = this.__createControlledStream()
      this.addOnDispose(this.__sharedControlledStream)
      this.__sharedControlledStream.addOnDispose(this)
    }

    return this.__sharedControlledStream
  }
}
