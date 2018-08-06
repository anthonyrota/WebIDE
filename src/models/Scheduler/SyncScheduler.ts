import { bound } from 'src/decorators/bound'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { ISubscription, Subscription } from 'src/models/Disposable/Subscription'
import {
  IScheduler,
  ISchedulerActionWithData,
  ISchedulerActionWithoutData
} from 'src/models/Scheduler/Scheduler'
import { getTime } from 'src/utils/getTime'
import { setTimeout } from 'src/utils/setTimeout'

abstract class SyncSchedulerAction extends Subscription {
  private __scheduleDelayedDisposable: IDisposable | null | void = null

  public dispose(): void {
    if (this.isActive()) {
      super.dispose()
      if (this.__scheduleDelayedDisposable) {
        this.__scheduleDelayedDisposable.dispose()
        this.__scheduleDelayedDisposable = null
      }
    }
  }

  protected execute(): void {
    if (this.__scheduleDelayedDisposable) {
      this.__scheduleDelayedDisposable.dispose()
      this.__scheduleDelayedDisposable = null
    }
    try {
      this.tryExecute()
    } catch (error) {
      this.dispose()
      throw error
    }
  }

  protected requestExecutionDelayed(delay: number): void {
    if (this.__scheduleDelayedDisposable) {
      this.__scheduleDelayedDisposable.dispose()
      this.__scheduleDelayedDisposable = null
    }
    this.__scheduleDelayedDisposable = setTimeout(this.__boundExecute, delay)
  }

  protected abstract tryExecute(): void

  @bound
  private __boundExecute(): void {
    this.execute()
  }
}

class SyncSchedulerActionWithData<T> extends SyncSchedulerAction
  implements ISchedulerActionWithData<T> {
  private __task: (data: T, action: ISchedulerActionWithData<T>) => void
  private __data!: T

  constructor(task: (data: T, action: ISchedulerActionWithData<T>) => void) {
    super()
    this.__task = task
  }

  public schedule(data: T): ISubscription {
    if (this.isActive()) {
      this.__data = data
      super.execute()
    }
    return this
  }

  public scheduleDelayed(data: T, delay: number): ISubscription {
    if (this.isActive()) {
      this.__data = data
      super.requestExecutionDelayed(delay)
    }
    return this
  }

  protected tryExecute(): void {
    const task = this.__task
    task(this.__data, this)
  }
}

class SyncSchedulerActionWithoutData extends SyncSchedulerAction
  implements ISchedulerActionWithoutData {
  private __task: (action: ISchedulerActionWithoutData) => void

  constructor(task: (action: ISchedulerActionWithoutData) => void) {
    super()
    this.__task = task
  }

  public schedule(): ISubscription {
    if (this.isActive()) {
      super.execute()
    }
    return this
  }

  public scheduleDelayed(delay: number): ISubscription {
    if (this.isActive()) {
      super.requestExecutionDelayed(delay)
    }
    return this
  }

  protected tryExecute(): void {
    const task = this.__task
    task(this)
  }
}

export class SyncScheduler implements IScheduler {
  public now(): number {
    return getTime()
  }

  public schedule(
    task: (action: ISchedulerActionWithoutData) => void
  ): ISubscription {
    return new SyncSchedulerActionWithoutData(task).schedule()
  }

  public scheduleWithData<T>(
    task: (data: T, action: ISchedulerActionWithData<T>) => void,
    data: T
  ): ISubscription {
    return new SyncSchedulerActionWithData<T>(task).schedule(data)
  }

  public scheduleDelayed(
    task: (action: ISchedulerActionWithoutData) => void,
    delay: number
  ): ISubscription {
    return new SyncSchedulerActionWithoutData(task).scheduleDelayed(delay)
  }

  public scheduleDelayedWithData<T>(
    task: (data: T, action: ISchedulerActionWithData<T>) => void,
    data: T,
    delay: number
  ): ISubscription {
    return new SyncSchedulerActionWithData<T>(task).scheduleDelayed(data, delay)
  }
}
