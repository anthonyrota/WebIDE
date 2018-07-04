import { ISchedulerTask } from 'src/models/Scheduler/IScheduler'
import { ISchedulerActions } from 'src/models/Scheduler/SchedulerTaskList/ISchedulerActions'
import { SchedulerTaskList } from 'src/models/Scheduler/SchedulerTaskList/SchedulerTaskList'

export class SchedulerTaskListActions implements ISchedulerActions {
  private __schedulerTaskList: SchedulerTaskList

  constructor(schedulerTaskList: SchedulerTaskList) {
    this.__schedulerTaskList = schedulerTaskList
  }

  public addTask(task: ISchedulerTask<any>): void {
    this.__schedulerTaskList.addTask(task)
  }

  public removeTask(task: ISchedulerTask<any>): void {
    this.__schedulerTaskList.removeTask(task)
  }
}
