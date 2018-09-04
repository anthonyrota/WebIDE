import { bound } from 'src/decorators/bound'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { Subscription } from 'src/models/Disposable/Subscription'
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
    if (this.isDisposed()) {
      return
    }
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
    if (this.isDisposed()) {
      return
    }
    if (delay === 0) {
      this.execute()
    }
    if (this.__scheduleDelayedDisposable) {
      this.__scheduleDelayedDisposable.dispose()
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

  public scheduleWithData(data: T): this {
    if (this.isActive()) {
      this.__data = data
      super.execute()
    }
    return this
  }

  public scheduleDelayedWithData(delay: number, data: T): this {
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

  public schedule(): this {
    if (this.isActive()) {
      super.execute()
    }
    return this
  }

  public scheduleDelayed(delay: number): this {
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
  ): ISchedulerActionWithoutData {
    return new SyncSchedulerActionWithoutData(task).schedule()
  }

  public scheduleWithData<T>(
    task: (data: T, action: ISchedulerActionWithData<T>) => void,
    data: T
  ): ISchedulerActionWithData<T> {
    return new SyncSchedulerActionWithData<T>(task).scheduleWithData(data)
  }

  public scheduleDelayed(
    task: (action: ISchedulerActionWithoutData) => void,
    delay: number
  ): ISchedulerActionWithoutData {
    return new SyncSchedulerActionWithoutData(task).scheduleDelayed(delay)
  }

  public scheduleDelayedWithData<T>(
    task: (data: T, action: ISchedulerActionWithData<T>) => void,
    delay: number,
    data: T
  ): ISchedulerActionWithData<T> {
    return new SyncSchedulerActionWithData<T>(task).scheduleDelayedWithData(
      delay,
      data
    )
  }
}
