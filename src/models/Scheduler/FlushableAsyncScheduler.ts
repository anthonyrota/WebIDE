import { bound } from 'src/decorators/bound'
import { AsyncAction } from 'src/models/Scheduler/AsyncAction'
import { AsyncScheduler } from 'src/models/Scheduler/AsyncScheduler'

export abstract class FlushableAsyncScheduler extends AsyncScheduler {
  private __isExecutingActions: boolean = false
  private __actionsToAddAfterFinishedExecuting: AsyncAction[] = []

  public scheduleAction(action: AsyncAction): void {
    if (this.__isExecutingActions) {
      this.__actionsToAddAfterFinishedExecuting.push(action)
    } else {
      super.scheduleAction(action)
    }
  }

  @bound
  protected executeAllActions(): void {
    this.__isExecutingActions = true

    let action: AsyncAction | void

    while ((action = this.shiftAction())) {
      const result = action.execute()

      if (result) {
        this.disposeScheduled()

        while ((action = this.shiftAction())) {
          action.disposeWithoutRemovingFromScheduler()
        }

        while ((action = this.__actionsToAddAfterFinishedExecuting.shift())) {
          action.disposeWithoutRemovingFromScheduler()
        }

        this.__isExecutingActions = false
        throw result.error
      }
    }

    this.__isExecutingActions = false
    this.disposeScheduled()
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
