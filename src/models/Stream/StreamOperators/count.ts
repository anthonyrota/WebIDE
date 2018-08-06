import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import {
  MonoTypeValueTransmitter,
  ValueTransmitter
} from 'src/models/Stream/ValueTransmitter'
import { always } from 'src/utils/always'

export const count = always<IConnectOperator<any, number>>({
  connect(
    target: MonoTypeValueTransmitter<number>,
    source: Stream<any>
  ): IDisposableLike {
    return source.subscribe(new CountSubscriber(target))
  }
})

class CountSubscriber extends ValueTransmitter<any, number> {
  private count: number = 0

  protected onNextValue(): void {
    this.count++
  }

  protected onComplete(): void {
    this.destination.next(this.count)
    this.destination.complete()
  }
}
