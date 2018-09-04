import { AsyncAction } from 'src/models/Scheduler/AsyncAction'
import { AsyncScheduler } from 'src/models/Scheduler/AsyncScheduler'
import { ISchedulerActionWithData } from 'src/models/Scheduler/Scheduler'

export class AsyncActionWithData<T> extends AsyncAction
  implements ISchedulerActionWithData<T> {
  private __task: (data: T, action: ISchedulerActionWithData<T>) => void
  private __data!: T

  constructor(
    scheduler: AsyncScheduler,
    task: (data: T, action: ISchedulerActionWithData<T>) => void
  ) {
    super(scheduler)
    this.__task = task
  }

  public scheduleWithData(data: T): this {
    if (this.isActive()) {
      this.__data = data
      super.requestExecution()
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

  protected tryExecute() {
    const task = this.__task
    task(this.__data, this)
  }
}
