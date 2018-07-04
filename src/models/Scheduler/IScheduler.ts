import { IDisposable } from 'src/models/Disposable/IDisposable'
import { Stream } from 'src/models/Stream/Stream/Stream'

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
