import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { always } from 'src/utils/always'

export const completeImmediately = always<IConnectOperator<any, never>>({
  connect(
    target: MonoTypeValueTransmitter<never>,
    source: Stream<any>
  ): IDisposableLike {
    target.complete()
  }
})
