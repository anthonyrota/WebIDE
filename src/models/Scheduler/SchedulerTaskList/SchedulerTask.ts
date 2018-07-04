import {
  ISchedulerReturnMessage,
  ISchedulerTask,
  SchedulerReturnMessageCommand
} from 'src/models/Scheduler/IScheduler'
import { ISchedulerActions } from 'src/models/Scheduler/SchedulerTaskList/ISchedulerActions'
import { Stream } from 'src/models/Stream/Stream/Stream'
import { StreamDistributor } from 'src/models/Stream/StreamDistributor/StreamDistributor'
import { StreamSource } from 'src/models/Stream/StreamSource/StreamSource'

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
