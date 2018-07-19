import { IDisposable } from 'src/models/Disposable/IDisposable'
import { ISubscription } from 'src/models/Disposable/Subscription'
import { AsyncAction } from 'src/models/Scheduler/AsyncAction'
import { AsyncActionWithData } from 'src/models/Scheduler/AsyncActionWithData'
import { AsyncActionWithoutData } from 'src/models/Scheduler/AsyncActionWithoutData'
import {
  IScheduler,
  ISchedulerActionWithData,
  ISchedulerActionWithoutData
} from 'src/models/Scheduler/Scheduler'
import { getTime } from 'src/utils/getTime'
import { removeOnce } from 'src/utils/removeOnce'

export abstract class AsyncScheduler implements IScheduler {
  private __actions: AsyncAction[] = []
  private __scheduled: IDisposable | null = null

  public now(): number {
    return getTime()
  }

  public schedule(
    task: (action: ISchedulerActionWithoutData) => void
  ): ISubscription {
    const action = new AsyncActionWithoutData(this, task)
    this.scheduleAction(action)
    return action
  }

  public scheduleWithData<T>(
    task: (data: T, action: ISchedulerActionWithData<T>) => void,
    data: T
  ): ISubscription {
    const action = new AsyncActionWithData<T>(this, task, data)
    this.scheduleAction(action)
    return action
  }

  public scheduleDelayed(
    task: (action: ISchedulerActionWithoutData) => void,
    delay: number
  ): ISubscription {
    const action = new AsyncActionWithoutData(this, task)
    this.scheduleActionDelayed(action, delay)
    return action
  }

  public scheduleDelayedWithData<T>(
    task: (data: T, action: ISchedulerActionWithData<T>) => void,
    data: T,
    delay: number
  ): ISubscription {
    const action = new AsyncActionWithData(this, task, data)
    this.scheduleActionDelayed(action, delay)
    return action
  }

  public scheduleAction(action: AsyncAction): void {
    this.__actions.push(action)
    if (!this.__scheduled) {
      this.__scheduled = this.requestExecutionOfAllActions()
    }
  }

  public scheduleActionDelayed(
    action: AsyncAction,
    delay: number
  ): IDisposable {
    return this.requestExecutionOfActionDelayed(action, delay)
  }

  public removeAction(action: AsyncAction): void {
    removeOnce(action, this.__actions)

    if (this.__actions.length === 0 && this.__scheduled) {
      this.__scheduled.dispose()
      this.__scheduled = null
    }
  }

  protected reschedule(): void {
    if (this.__scheduled) {
      this.__scheduled.dispose()
    }
    this.__scheduled = this.requestExecutionOfAllActions()
  }

  protected shiftAction(): AsyncAction | void {
    return this.__actions.shift()
  }

  protected hasActions(): boolean {
    return this.__actions.length > 0
  }

  protected disposeScheduled(): void {
    if (this.__scheduled) {
      this.__scheduled.dispose()
      this.__scheduled = null
    }
  }

  protected abstract requestExecutionOfAllActions(): IDisposable
  protected abstract requestExecutionOfActionDelayed(
    action: AsyncAction,
    delay: number
  ): IDisposable
}
