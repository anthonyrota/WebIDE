import { operateThroughValueTransmitter } from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { always } from 'src/utils/always'

export const skipAll = always(
  operateThroughValueTransmitter<unknown, never>(
    target => new SkipAllValueTransmitter(target)
  )
)

class SkipAllValueTransmitter extends ValueTransmitter<unknown, never> {
  protected onNextValue() {}
}
