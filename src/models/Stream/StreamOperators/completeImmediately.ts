import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { always } from 'src/utils/always'

export const completeImmediately = always<IOperator<any, never>>({
  connect(
    target: IRequiredSubscriber<never>,
    source: Stream<any>
  ): IDisposableLike {
    target.complete()
  }
})
