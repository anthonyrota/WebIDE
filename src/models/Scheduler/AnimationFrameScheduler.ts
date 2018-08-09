import { IDisposable } from 'src/models/Disposable/IDisposable'
import { AsyncAction } from 'src/models/Scheduler/AsyncAction'
import { FlushableAsyncScheduler } from 'src/models/Scheduler/FlushableAsyncScheduler'
import { setTimeout } from 'src/utils/setTimeout'

export class AnimationFrameScheduler extends FlushableAsyncScheduler {
  protected requestExecutionOfAllActions(): IDisposable {
    return setImmediate(this.executeAllActions)
  }

  protected requestExecutionOfActionDelayed(
    action: AsyncAction,
    delay: number
  ): IDisposable {
    return setTimeout(action.boundScheduleSelf, delay)
  }
}
