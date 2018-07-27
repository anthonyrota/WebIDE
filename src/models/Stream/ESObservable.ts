import { $$observable } from 'src/utils/observableSymbol'

export interface IESObservableObserver<T> {
  next(value: T): void
  error(error: any): void
  complete(): void
}

export interface IESObservableSubscription {
  closed: boolean
  unsubscribe(): void
}

export interface IESInteropObservable<T> {
  [$$observable](): IESObservable<T>
}

export interface IESObservable<T> extends IESInteropObservable<T> {
  subscribe(observer: IESObservableObserver<T>): IESObservableSubscription
  subscribe(
    onNext?: (value: T) => void,
    onError?: (error: any) => void,
    onComplete?: () => void
  ): IESObservableSubscription
}
