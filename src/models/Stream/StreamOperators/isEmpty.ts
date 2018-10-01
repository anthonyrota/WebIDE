import { operateThroughValueTransmitter } from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { always } from 'src/utils/always'

export const isEmpty = always(
  operateThroughValueTransmitter<unknown, boolean>(
    target => new IsEmptySubscriber(target)
  )
)

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
