import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export interface IOperator<
  TInput,
  TOutput,
  TStream extends Stream<TInput> = Stream<TInput>
> {
  connect(
    target: ValueTransmitter<TOutput, any>,
    source: TStream
  ): IDisposableLike
}
