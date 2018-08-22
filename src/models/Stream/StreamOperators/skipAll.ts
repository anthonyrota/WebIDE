import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { always } from 'src/utils/always'

export const skipAll = always<IOperator<unknown, never>>({
  connect(target: ISubscriber<never>, source: Stream<unknown>): DisposableLike {
    return source.subscribe(new SkipAllSubscriber(target))
  }
})

class SkipAllSubscriber extends ValueTransmitter<unknown, never> {
  protected onNextValue() {}
}
