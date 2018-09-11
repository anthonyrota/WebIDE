import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import {
  isSubscriptionPropertyKey,
  ISubscription,
  Subscription
} from 'src/models/Disposable/Subscription'
import { IControlledStream } from 'src/models/Stream/ControlledStream'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { WeakMap } from 'src/utils/WeakMap'

export class SharedStream<T> extends Stream<T> implements ISubscription {
  public readonly [isSubscriptionPropertyKey] = true
  private __sharedControlledStream: IControlledStream<T, T> | null = null
  private __source: Stream<T>
  private __createControlledStream: () => IControlledStream<T, T>
  private __selfSubscription: ISubscription = new Subscription()

  constructor(
    source: Stream<T>,
    createControlledStream: () => IControlledStream<T, T>
  ) {
    super()
    this.__source = source
    this.__createControlledStream = createControlledStream
  }

  public add(disposableLike: DisposableLike): void {
    this.__selfSubscription.add(disposableLike)
  }

  public remove(disposableLike: DisposableLike): void {
    this.__selfSubscription.remove(disposableLike)
  }

  public isActive(): boolean {
    return this.__selfSubscription.isActive()
  }

  public dispose(): void {
    this.__selfSubscription.dispose()
  }

  public activateSource(): ISubscription {
    return this.__source.subscribe(this.createSharedControlledStream())
  }

  protected trySubscribe(target: ISubscriber<T>): DisposableLike {
    return this.createSharedControlledStream().subscribe(target)
  }

  private createSharedControlledStream(): IControlledStream<T, T> {
    if (!this.__sharedControlledStream) {
      this.__sharedControlledStream = this.__createControlledStream()
      this.add(this.__sharedControlledStream)
    }

    return this.__sharedControlledStream
  }
}

export function activeOnlyWhenHasSubscribers<T>(): IOperator<
  T,
  T,
  SharedStream<T>
> {
  return new ActiveOnlyWhenHasSubscribersOperator<T>()
}

class ActiveOnlyWhenHasSubscribersOperator<T>
  implements IOperator<T, T, SharedStream<T>> {
  private sharedStreamDataMap = new WeakMap<
    SharedStream<T>,
    { subscriptionsCount: number; sourceSubscription: ISubscription }
  >()

  public connect(
    target: ISubscriber<T>,
    source: SharedStream<T>
  ): DisposableLike {
    if (!this.sharedStreamDataMap.get(source)) {
      this.sharedStreamDataMap.set(source, {
        subscriptionsCount: 0,
        sourceSubscription: source.activateSource()
      })
    }

    // @todo
  }
}

// function refCount<T>(this: ConnectableObservable<T>) {
//   let _refCounter = 0;
//   let _connection: Subscription;

//   return sourceAsObservable((type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
//     _refCounter++;

//     subs.add(() => {
//       _refCounter--;
//       if (_refCounter === 0) {
//         _connection.unsubscribe();
//       }
//     });

//     if (_refCounter === 1) {
//       _connection = this.connect();
//     }
//   });
// }
