export interface IESObservableObserver<T> {
  next(value: T): void
  error(error: unknown): void
  complete(): void
}

export interface IESObservableSubscription {
  closed: boolean
  unsubscribe(): void
}

export interface IESInteropObservable<T> {
  [Symbol.observable](): IESObservable<T>
}

export interface IESObservable<T> extends IESInteropObservable<T> {
  subscribe(observer: IESObservableObserver<T>): IESObservableSubscription
  subscribe(
    onNext?: (value: T) => void,
    onError?: (error: unknown) => void,
    onComplete?: () => void
  ): IESObservableSubscription
}
