import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { always } from 'src/utils/always'

export const isEmpty = always<IOperator<unknown, boolean>>({
  connect(
    target: ISubscriber<boolean>,
    source: Stream<unknown>
  ): DisposableLike {
    return source.subscribe(new IsEmptySubscriber(target))
  }
})

class IsEmptySubscriber extends ValueTransmitter<unknown, boolean> {
  protected onNextValue(): void {
    this.destination.next(false)
    this.destination.complete()
  }

  protected onComplete(): void {
    this.destination.next(true)
    this.destination.complete()
  }
}
