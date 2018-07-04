import { IDisposable } from 'src/models/Disposable/IDisposable'
import { ISchedulerTask } from 'src/models/Scheduler/IScheduler'
import { Stream } from 'src/models/Stream/Stream/Stream'
import { StreamDistributor } from 'src/models/Stream/StreamDistributor/StreamDistributor'
import { StreamSource } from 'src/models/Stream/StreamSource/StreamSource'
import { indexOf } from 'src/utils/indexOf'
import { splice } from 'src/utils/splice'

export class SchedulerTaskList implements IDisposable {
  private __tasks: Array<ISchedulerTask<any>>
  private __nextTaskIndex: number
  private __onAllTasksRemovedStreamDistributor: StreamDistributor<void>
  private __onAllTasksRemovedStreamSource: StreamSource<void>
  private __onAllTasksRemovedStream: Stream<void>
  private __onShouldScheduleWorkStreamDistributor: StreamDistributor<void>
  private __onShouldScheduleWorkStreamSource: StreamSource<void>
  private __onShouldScheduleWorkStream: Stream<void>

  constructor() {
    this.__tasks = []
    this.__nextTaskIndex = 0
    this.__onAllTasksRemovedStreamDistributor = new StreamDistributor<void>()
    this.__onAllTasksRemovedStreamSource = new StreamSource<void>(
      this.__onAllTasksRemovedStreamDistributor
    )
    this.__onAllTasksRemovedStream = new Stream<void>(
      this.__onAllTasksRemovedStreamSource,
      this.__onAllTasksRemovedStreamDistributor
    )
    this.__onShouldScheduleWorkStreamDistributor = new StreamDistributor<void>()
    this.__onShouldScheduleWorkStreamSource = new StreamSource<void>(
      this.__onShouldScheduleWorkStreamDistributor
    )
    this.__onShouldScheduleWorkStream = new Stream<void>(
      this.__onShouldScheduleWorkStreamSource,
      this.__onShouldScheduleWorkStreamDistributor
    )
  }

  public addTask(task: ISchedulerTask<any>): void {
    if (indexOf(task, this.__tasks) !== -1) {
      this.__tasks.push(task)
      this.__onShouldScheduleWorkStreamSource.next(undefined)
    }
  }

  public removeTask(task: ISchedulerTask<any>): void {
    const taskIndex = indexOf(task, this.__tasks)

    if (taskIndex === -1) {
      return
    }

    if (this.__nextTaskIndex > taskIndex) {
      this.__nextTaskIndex--
    }

    splice(1, taskIndex, this.__tasks)

    if (this.__tasks.length === 0) {
      this.__onAllTasksRemovedStreamSource.next(undefined)
    }
  }

  public hasTasks(): boolean {
    return this.__tasks.length > 0
  }

  public getOnAllTasksRemovedStream(): Stream<void> {
    return this.__onAllTasksRemovedStream
  }

  public getOnShouldScheduleWorkStream(): Stream<void> {
    return this.__onShouldScheduleWorkStream
  }

  public getNextTask(): ISchedulerTask<any> {
    this.__nextTaskIndex = (this.__nextTaskIndex + 1) % this.__tasks.length
    return this.__tasks[this.__nextTaskIndex]
  }

  public dispose(): void {
    this.__onAllTasksRemovedStream.dispose()
    this.__onShouldScheduleWorkStream.dispose()
  }
}
