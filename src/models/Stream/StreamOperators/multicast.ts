import { IControlledStream } from 'src/models/Stream/ControlledStream'
import { operate, Operation } from 'src/models/Stream/Operation'
import { SharedStream } from 'src/models/Stream/SharedStream'
import { Stream } from 'src/models/Stream/Stream'

export function multicast<T, U>(
  createControlledStream: () => IControlledStream<T, T>,
  createValueStream: (sharedStream: Stream<T>) => Stream<U>
): Operation<T, U> {
  return operate((source, target) => {
    const shared = new SharedStream(source, createControlledStream)
    const values = createValueStream(shared)

    target.addOnDispose(shared)
    values.subscribe(target)
    shared.activateSource()
  })
}
