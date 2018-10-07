import { getTime } from 'src/utils/getTime'
import { operateThroughValueTransmitter, Operation } from '../Operation'
import { ValueTransmitter } from '../ValueTransmitter'

export function withTimeDifference<T>(): Operation<
  T,
  IValueWithTimeDifference<T>
> {
  return operateThroughValueTransmitter(
    target => new WithTimeDifferenceValueTransmitter(target)
  )
}

export interface IValueWithTimeDifference<T> {
  value: T
  timeDifference: number
}

class WithTimeDifferenceValueTransmitter<T> extends ValueTransmitter<
  T,
  IValueWithTimeDifference<T>
> {
  private lastTime: number = getTime()

  protected onNextValue(value: T): void {
    const currentTime = getTime()
    const timeDifference = currentTime - this.lastTime

    this.lastTime = currentTime
    this.destination.next({ value, timeDifference })
  }
}
