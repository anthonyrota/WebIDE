import { IDisposable } from 'src/models/Disposable/IDisposable'
import { Stream } from 'src/models/Stream/Stream/Stream'
import { StreamDistributor } from 'src/models/Stream/StreamDistributor/StreamDistributor'
import { StreamSource } from 'src/models/Stream/StreamSource/StreamSource'
import { indexOf } from 'src/utils/indexOf'
import { splice } from 'src/utils/splice'

export const enum SchedulerReturnMessageCommand {
  RepeatTask = 0,
  TerminateTask = 1,
  PauseTask = 2
}

export interface ISchedulerReturnMessage<T> {
  next: SchedulerReturnMessageCommand
  value?: T
}

export interface ISchedulerTask<T> extends IDisposable {
  getOutputStream(): Stream<T>
  continue(): void
  pause(): void
  perform(options?: { distributeValue: boolean }): T | undefined
  distributeValue(value: T): void
  distributeError(error: any): void
  isTerminated(): boolean
  isActive(): boolean
}

export interface IScheduler extends IDisposable {
  addTask<T>(
    perform: () => ISchedulerReturnMessage<T> | void
  ): ISchedulerTask<T>
  pause(): void
  continue(): void
  isActive(): void
}

export interface ISchedulerActions {
  removeTask(task: ISchedulerTask<any>): void
  addTask(task: ISchedulerTask<any>): void
}

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

export class SchedulerTask<T> implements ISchedulerTask<T> {
  private __perform: () => ISchedulerReturnMessage<T> | void
  private __taskActions: ISchedulerActions
  private __outputStreamDistributor: StreamDistributor<T>
  private __outputStreamSource: StreamSource<T>
  private __outputStream: Stream<T>
  private __isTerminated: boolean
  private __isPaused: boolean

  constructor(
    perform: () => ISchedulerReturnMessage<T> | void,
    actions: ISchedulerActions
  ) {
    this.__perform = perform
    this.__taskActions = actions
    this.__taskActions.addTask(this)
    this.__isTerminated = false
    this.__isPaused = false
    this.__outputStreamDistributor = new StreamDistributor()
    this.__outputStreamSource = new StreamSource(this.__outputStreamDistributor)
    this.__outputStream = new Stream(
      this.__outputStreamSource,
      this.__outputStreamDistributor
    )
  }

  public perform(options?: { distributeValue: boolean }): T | undefined {
    let message: ISchedulerReturnMessage<any> | void

    try {
      message = this.__perform()
    } catch (error) {
      this.__outputStreamSource.error(error)
      this.dispose()
    }

    if (message != null) {
      if (
        typeof message.value !== 'undefined' &&
        !(typeof options !== 'undefined' && !options.distributeValue)
      ) {
        this.__outputStreamSource.next(message.value)
      }
      if (message.next === SchedulerReturnMessageCommand.TerminateTask) {
        this.dispose()
      } else if (message.next === SchedulerReturnMessageCommand.PauseTask) {
        this.pause()
      }
    }

    return message && message.value
  }

  public distributeValue(value: T): void {
    this.__outputStreamSource.next(value)
  }

  public distributeError(error: any): void {
    this.__outputStreamSource.error(error)
  }

  public getOutputStream(): Stream<T> {
    return this.__outputStream
  }

  public pause(): void {
    if (!this.__isPaused && !this.__isTerminated) {
      this.__isPaused = true
      this.__taskActions.removeTask(this)
    }
  }

  public continue(): void {
    if (this.__isPaused || this.__isTerminated) {
      this.__taskActions.addTask(this)
    }
  }

  public dispose(): void {
    if (!this.__isTerminated) {
      this.__isTerminated = true
      this.__outputStream.dispose()
      this.__taskActions.removeTask(this)
    }
  }

  public isTerminated(): boolean {
    return !this.__isTerminated
  }

  public isActive(): boolean {
    return !this.__isPaused && !this.__isTerminated
  }
}
