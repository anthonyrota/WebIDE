import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { Maybe } from 'src/models/Maybe/Maybe'
import { getTime } from 'src/utils/getTime'

export interface IScheduler {
  /**
   * Represents the current type, from the scheduler's perpective
   * Note: This does not have to represent real world time, or, in fact,
   * any time system which makes sense
   */
  now(): number
  /**
   * Schedules the action to be called in the future
   * @param action The callback to schedule. The return type of this is
   *   an optional, but if present empty {@link Maybe}. If the maybe is
   *   some(), then the action will be rescheduled and called again. If
   *   the maybe is none(), or nothing is returned, then nothing extra
   *   will happen after the action is called
   * @returns A conscious disposable, which when disposed will cancel
   *   the action from being scheduled. If disposed after the action
   *   has already been stopped, or has already been run, nothing will
   *   happen. However, if the action has already been run and the
   *   callback returned a non empty maybe, meaning that the action
   *   will be rescheduled, then disposing the returned disposable
   *   will cancel the action from being rescheduled.
   */
  schedule(action: () => Maybe<void> | void): IConsciousDisposable
  /**
   * Schedules the action to be called in the future
   * @param action The callback to schedule. The return type of this is
   *   an optional, but if present {@link Maybe} with type `T` (the
   *   type of the data given to the schedule function). If the maybe
   *   has a value, then the action will be rescheduled and called
   *   again with the returned maybe's value. If the maybe is none(),
   *   or nothing is returned, then nothing extra will happen after the
   *   action is called
   * @param data The data to be passed into the `action` callback
   * @returns A conscious disposable, which when disposed will cancel
   *   the action from being scheduled. If disposed after the action
   *   has already been stopped, or has already been run, nothing will
   *   happen. Hoewver, if the action has already been run and the
   *   callback returned a non empty maybe, meaning that the action
   *   will be rescheduled, then disposing the returned disposable
   *   will cancel the action from being recheduled
   */
  schedule<T>(
    action: (data: T) => Maybe<T> | void,
    data: T
  ): IConsciousDisposable
}

export abstract class Scheduler implements IScheduler {
  public now(): number {
    return getTime()
  }

  public abstract schedule(action: () => void): IConsciousDisposable
  public abstract schedule<T>(
    action: (data: T) => void,
    data: T
  ): IConsciousDisposable
}
