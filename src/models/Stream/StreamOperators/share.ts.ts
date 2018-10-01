import { ControlledStream } from 'src/models/Stream/ControlledStream'
import { Operation, transform } from 'src/models/Stream/Operation'
import { createLazySharedStream } from 'src/models/Stream/StreamConstructors/createLazySharedStream'

export function share<T>(): Operation<T, T> {
  return transform(source =>
    createLazySharedStream<T>(source, () => new ControlledStream<T>())
  )
}
