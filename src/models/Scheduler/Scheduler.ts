import { ISubscription } from 'src/models/Disposable/Subscription'

export interface ISchedulerActionWithData<T> extends ISubscription {
  schedule(data: T): ISubscription
  scheduleDelayed(data: T, delay: number): ISubscription
}

export interface ISchedulerActionWithoutData extends ISubscription {
  schedule(): ISubscription
  scheduleDelayed(delay: number): ISubscription
}

export interface IScheduler {
  now(): number
  schedule(
    task: (action: ISchedulerActionWithoutData) => void
  ): ISchedulerActionWithoutData
  scheduleWithData<T>(
    task: (data: T, action: ISchedulerActionWithData<T>) => void,
    data: T
  ): ISchedulerActionWithData<T>
  scheduleDelayed(
    task: (action: ISchedulerActionWithoutData) => void,
    delay: number
  ): ISchedulerActionWithoutData
  scheduleDelayedWithData<T>(
    task: (data: T, action: ISchedulerActionWithData<T>) => void,
    data: T,
    delay: number
  ): ISchedulerActionWithData<T>
}
