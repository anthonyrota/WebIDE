import { IDisposable } from 'src/models/Disposable/IDisposable'
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
  private __scheduled: IDisposable | null | void = null

  public now(): number {
    return getTime()
  }

  public schedule(
    task: (action: ISchedulerActionWithoutData) => void
  ): ISchedulerActionWithoutData {
    return new AsyncActionWithoutData(this, task).schedule()
  }

  public scheduleWithData<T>(
    task: (data: T, action: ISchedulerActionWithData<T>) => void,
    data: T
  ): ISchedulerActionWithData<T> {
    return new AsyncActionWithData<T>(this, task).schedule(data)
  }

  public scheduleDelayed(
    task: (action: ISchedulerActionWithoutData) => void,
    delay: number
  ): ISchedulerActionWithoutData {
    return new AsyncActionWithoutData(this, task).scheduleDelayed(delay)
  }

  public scheduleDelayedWithData<T>(
    task: (data: T, action: ISchedulerActionWithData<T>) => void,
    data: T,
    delay: number
  ): ISchedulerActionWithData<T> {
    return new AsyncActionWithData<T>(this, task).scheduleDelayed(data, delay)
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
