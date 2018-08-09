import { DisposableLike } from 'src/models/Disposable/DisposableLike'
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
  ): DisposableLike
}
