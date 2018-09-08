import { IDisposable } from 'src/models/Disposable/IDisposable'
import { AsyncAction } from 'src/models/Scheduler/AsyncAction'
import { FlushableAsyncScheduler } from 'src/models/Scheduler/FlushableAsyncScheduler'
import { setTimeout } from 'src/utils/setTimeout'

export class DelayScheduler extends FlushableAsyncScheduler {
  private __delay: number

  constructor(delay: number) {
    super()
    this.__delay = delay
  }

  protected requestExecutionOfAllActions(): IDisposable {
    return setTimeout(this.executeAllActions, this.__delay)
  }

  protected requestExecutionOfActionDelayed(
    action: AsyncAction,
    delay: number
  ): IDisposable {
    return setTimeout(() => action.executeAndRemoveFromScheduler(), delay)
  }
}
