import { bound } from 'src/decorators/bound'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { AsyncAction } from 'src/models/Scheduler/AsyncAction'
import { AsyncScheduler } from 'src/models/Scheduler/AsyncScheduler'
import { IDeadline, requestIdleCallback } from 'src/utils/requestIdleCallback'
import { setTimeout } from 'src/utils/setTimeout'

export class IdleScheduler extends AsyncScheduler {
  private __isExecutingActions: boolean = false
  private __actionsToAddAfterFinishedExecuting: AsyncAction[] = []

  public scheduleAction(action: AsyncAction): void {
    if (this.__isExecutingActions) {
      this.__actionsToAddAfterFinishedExecuting.push(action)
    } else {
      super.scheduleAction(action)
    }
  }

  protected requestExecutionOfAllActions(): IDisposable {
    return requestIdleCallback(this.__executeAllActions)
  }

  protected requestExecutionOfActionDelayed(
    action: AsyncAction,
    delay: number
  ): IDisposable {
    return setTimeout(action.boundScheduleSelf, delay)
  }

  @bound
  private __executeAllActions(deadline: IDeadline): void {
    this.__isExecutingActions = true

    let action: AsyncAction | void

    while (
      deadline.getTimeRemaining() > 0 &&
      !deadline.didTimeout &&
      (action = this.shiftAction())
    ) {
      const result = action.execute()

      if (result) {
        this.__isExecutingActions = false
        this.disposeScheduled()

        while ((action = this.shiftAction())) {
          action.disposeWithoutRemovingFromScheduler()
        }

        this.__isExecutingActions = false
        this.__actionsToAddAfterFinishedExecuting.length = 0
        throw result.error
      }
    }

    this.__isExecutingActions = false
    this.disposeScheduled()

    if (
      this.hasActions() &&
      this.__actionsToAddAfterFinishedExecuting.length === 0
    ) {
      this.reschedule()
    }

    this.__addActionsAfterFinishedExecuting()
  }

  private __addActionsAfterFinishedExecuting(): void {
    for (let i = 0; i < this.__actionsToAddAfterFinishedExecuting.length; i++) {
      if (this.__actionsToAddAfterFinishedExecuting[i].isScheduled()) {
        super.scheduleAction(this.__actionsToAddAfterFinishedExecuting[i])
      }
    }

    this.__actionsToAddAfterFinishedExecuting.length = 0
  }
}
