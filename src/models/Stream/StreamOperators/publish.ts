import { ControlledStream } from 'src/models/Stream/ControlledStream'
import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { multicast } from 'src/models/Stream/StreamOperators/multicast'

export function publish<T, U>(
  createValueStream: (shared: Stream<T>) => Stream<U>
): Operation<T, U> {
  return multicast<T, U>(() => new ControlledStream<T>(), createValueStream)
}
