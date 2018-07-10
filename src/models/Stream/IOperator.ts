import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'

export interface IOperator<IInput, IOutput> {
  call(target: SubscriptionTarget<IOutput>, source: Stream<IInput>): void
}
