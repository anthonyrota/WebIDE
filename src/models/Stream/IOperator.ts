import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export interface IOperator<IInput, IOutput> {
  call(target: MonoTypeValueTransmitter<IOutput>, source: Stream<IInput>): void
}
