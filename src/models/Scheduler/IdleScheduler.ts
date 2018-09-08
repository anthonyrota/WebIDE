import { bound } from 'src/decorators/bound'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { AsyncAction } from 'src/models/Scheduler/AsyncAction'
import { AsyncScheduler } from 'src/models/Scheduler/AsyncScheduler'
import { IDeadline, requestIdleCallback } from 'src/utils/requestIdleCallback'
import { setTimeout } from 'src/utils/setTimeout'

export class IdleScheduler extends AsyncScheduler {
  protected requestExecutionOfAllActions(): IDisposable {
    return requestIdleCallback(this.__executeAllActions)
  }

  protected requestExecutionOfActionDelayed(
    action: AsyncAction,
    delay: number
  ) {
    return setTimeout(() => this.scheduleAction(action), delay)
  }

  @bound
  private __executeAllActions(deadline: IDeadline): void {
    let action: AsyncAction | void

    while (
      deadline.getTimeRemaining() > 0 &&
      !deadline.didTimeout &&
      (action = this.shiftAction())
    ) {
      const result = action.execute()

      if (result) {
        this.disposeScheduled()

        while ((action = this.shiftAction())) {
          action.disposeWithoutRemovingFromScheduler()
        }

        throw result.error
      }
    }

    this.disposeScheduled()

    if (this.hasActions()) {
      this.reschedule()
    }
  }
}
