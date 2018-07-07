import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'

export interface IOperator<IInput, IOutput> {
  call(target: StreamSubscriptionTarget<IOutput>, source: Stream<IInput>): void
}
