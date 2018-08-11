import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { always } from 'src/utils/always'

export const completeImmediately = always<IOperator<unknown, never>>({
  connect(
    target: IRequiredSubscriber<never>,
    source: Stream<unknown>
  ): DisposableLike {
    target.complete()
  }
})
