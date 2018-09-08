import { IDisposable } from 'src/models/Disposable/IDisposable'
import { AsyncAction } from 'src/models/Scheduler/AsyncAction'
import { FlushableAsyncScheduler } from 'src/models/Scheduler/FlushableAsyncScheduler'
import { setTimeout } from 'src/utils/setTimeout'

export class QueueScheduler extends FlushableAsyncScheduler {
  protected requestExecutionOfAllActions(): void {
    this.executeAllActions()
  }

  protected requestExecutionOfActionDelayed(
    action: AsyncAction,
    delay: number
  ): IDisposable {
    return setTimeout(() => action.executeAndRemoveFromScheduler(), delay)
  }
}
