import { Subscription } from 'src/models/Disposable/Subscription'
import { getTime } from 'src/utils/getTime'

interface ISchedulerAction {
  /**
   * Schedules the action to be called in the future
   * @param task The task to schedule. This callback, when called, will
   *   be called with a {@link ISchedulerAction}[scheduler action], which
   *   can be used to reschedule the task once
   * @returns A {@link Subscription}[subscription], which when disposed will cancel
   *   the action from beging scheduled, or rescheduled
   */
  schedule(task: (action: ISchedulerAction) => void): Subscription
  /**
   * Schedules the action to be called in the future with the given data
   * @param task The task to schedule. The first argument of this will
   *   be the data given to the `scheduleWithData` method. The second argument
   *   will be a {@link ISchedulerAction}[scheduler action] which can be used
   *   to reschedule the task once
   * @param data The data to be passed into the `task` argument
   * @returns A {@link Subscription}[subscription], which when disposed will cancel the
   *   action from being rescheduled
   */
  scheduleWithData<T>(
    task: (data: T, action: ISchedulerAction) => void,
    data: T
  ): Subscription
  /**
   * Schedules the action to be called after the specified delay according
   *   to the scheduler's internal time system
   * @param task The task to schedule. This callback, when called, will be
   *   called with a {@link ISchedulerAction}[scheduler action], which can be
   *   used to reschedule the task once
   * @param delay The amount of delay, according to the scheduler's internal
   *   time system, after which the task will be called
   * @returns A {@link Subscription}[subscription], which when disposed will cancel the
   *   action from being rescheduled
   */
  scheduleDelayed(
    task: (action: ISchedulerAction) => void,
    delay: number
  ): Subscription
  /**
   * Schedules the action to be called with the given data after the specified
   *   delay according to the scheduler's internal time system
   * @param task The task to schedule. This callback, when called, will be
   *   called with a {@link ISchedulerAction}[scheduler action], which can be
   *   used to reschedule the task once
   * @param delay The amount of delay, according to the scheduler's internal
   *   time system, after which the task will be called
   * @param data The data to be passed into the `task` argument
   * @returns A {@link Subscription}[subscription], which when disposed will cancel the
   *   action from being rescheduled
   */
  scheduleDelayedWithData<T>(
    task: (data: T, action: ISchedulerAction) => void,
    delay: number,
    data: T
  ): Subscription
}

export interface IScheduler extends ISchedulerAction {
  /**
   * Represents the current type, from the scheduler's perpective
   * Note: This does not have to represent real world time, or, in fact,
   * any time system which makes sense
   */
  now(): number
}

export abstract class Scheduler implements IScheduler {
  public now(): number {
    return getTime()
  }

  public abstract schedule(
    task: (action: ISchedulerAction) => void
  ): Subscription

  public abstract scheduleWithData<T>(
    task: (data: T, action: ISchedulerAction) => void,
    data: T
  ): Subscription

  public abstract scheduleDelayed(
    task: (action: ISchedulerAction) => void,
    delay: number
  ): Subscription

  public abstract scheduleDelayedWithData<T>(
    task: (data: T, action: ISchedulerAction) => void,
    delay: number,
    data: T
  ): Subscription
}
