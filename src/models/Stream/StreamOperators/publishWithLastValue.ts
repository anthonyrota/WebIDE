import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { multicast } from 'src/models/Stream/StreamOperators/multicast'
import { ControlledStreamWithLastValue } from '../ControlledStreamWithLastValue'

export function publishWithLastValue<T, U>(
  createValueStream: (shared: Stream<T>) => Stream<U>,
  initialValue: T
): Operation<T, U> {
  return multicast<T, U>(
    () => new ControlledStreamWithLastValue<T>(initialValue),
    createValueStream
  )
}
