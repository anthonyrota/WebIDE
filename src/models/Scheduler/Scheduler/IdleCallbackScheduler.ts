// import { bind } from 'src/decorators/bind'
// import {
//   IScheduler,
//   ISchedulerReturnMessage,
//   ISchedulerTask
// } from 'src/models/Scheduler/IScheduler'
// import { SchedulerTask } from 'src/models/Scheduler/SchedulerTaskList/SchedulerTask'
// import { SchedulerTaskList } from 'src/models/Scheduler/SchedulerTaskList/SchedulerTaskList'
// import { SchedulerTaskListActions } from 'src/models/Scheduler/SchedulerTaskList/SchedulerTaskListActions'
// import {
//   IDeadline,
//   requestIdleCallback,
//   RICSubscription
// } from 'src/utils/requestIdleCallback'

// export class IdleCallbackScheduler implements IScheduler {
//   private __isSchedulingWork: boolean
//   private __taskList: SchedulerTaskList
//   private __taskListActions: SchedulerTaskListActions
//   private __idleCallbackSubscription: RICSubscription | null
//   private __isActive: boolean
//   private __onlyDistributeLastValue: boolean

//   constructor(options?: { onlyDistributeLastValue: boolean }) {
//     this.__isSchedulingWork = false
//     this.__isActive = false
//     this.__idleCallbackSubscription = null
//     this.__onlyDistributeLastValue = !!(
//       options && options.onlyDistributeLastValue
//     )

//     this.__taskList = new SchedulerTaskList()
//     this.__taskListActions = new SchedulerTaskListActions(this.__taskList)

//     this.__taskList
//       .getOnAllTasksRemovedStream()
//       .subscribeWithOnNextValueListener(this.__onAllTasksRemoved)

//     this.__taskList
//       .getOnShouldScheduleWorkStream()
//       .subscribeWithOnNextValueListener(this.__scheduleWork)
//   }

//   public addTask<T>(
//     perform: () => ISchedulerReturnMessage<T>
//   ): ISchedulerTask<T> {
//     return new SchedulerTask<T>(perform, this.__taskListActions)
//   }

//   public pause(): void {
//     this.__isActive = false
//     if (this.__idleCallbackSubscription) {
//       this.__idleCallbackSubscription.dispose()
//     }
//   }

//   public continue(): void {
//     this.__isActive = true
//     this.__scheduleWork()
//   }

//   public isActive(): boolean {
//     return this.__isActive
//   }

//   public dispose(): void {
//     this.__taskList.dispose()
//   }

//   @bind
//   private __onAllTasksRemoved(): void {
//     this.pause()
//   }

//   @bind
//   private __scheduleWork(): void {
//     if (
//       this.__isActive &&
//       !this.__isSchedulingWork &&
//       this.__taskList.hasTasks()
//     ) {
//       this.__isSchedulingWork = true
//       this.__idleCallbackSubscription = requestIdleCallback(this.__performWork)
//     }
//   }

//   @bind
//   private __performWork(deadline: IDeadline): void {
//     if (this.__onlyDistributeLastValue) {
//       const tasksVisitedValues = new Map<ISchedulerTask<any>, any>()

//       while (this.__taskList.hasTasks() && deadline.timeRemaining() > 0) {
//         const task = this.__taskList.getNextTask()
//         const returnValue = task.perform({
//           distributeValue: false
//         })

//         if (typeof returnValue !== 'undefined') {
//           tasksVisitedValues.set(task, returnValue)
//         }
//       }

//       tasksVisitedValues.forEach(<T>(lastValue: T, task: ISchedulerTask<T>) => {
//         task.distributeValue(lastValue)
//       })
//     } else {
//       while (this.__taskList.hasTasks() && deadline.timeRemaining() > 0) {
//         const task = this.__taskList.getNextTask()

//         task.perform()
//       }
//     }

//     this.__idleCallbackSubscription = null
//   }
// }
