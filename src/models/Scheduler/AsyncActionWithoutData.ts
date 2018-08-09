import { AsyncAction } from 'src/models/Scheduler/AsyncAction'
import { AsyncScheduler } from 'src/models/Scheduler/AsyncScheduler'
import { ISchedulerActionWithoutData } from 'src/models/Scheduler/Scheduler'

export class AsyncActionWithoutData extends AsyncAction
  implements ISchedulerActionWithoutData {
  private __task: (action: ISchedulerActionWithoutData) => void

  constructor(
    scheduler: AsyncScheduler,
    task: (action: ISchedulerActionWithoutData) => void
  ) {
    super(scheduler)
    this.__task = task
  }

  public schedule(): this {
    if (this.isActive()) {
      super.requestExecution()
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
