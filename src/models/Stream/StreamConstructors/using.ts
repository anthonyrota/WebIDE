import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { Subscription } from 'src/models/Disposable/Subscription'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function using<T>(
  createResource: () => DisposableLike,
  createStream: (resource: DisposableLike) => Stream<T>
): Stream<T> {
  return new RawStream<T>(target => {
    const resource = createResource()
    const stream = createStream(resource)

    return new Subscription([resource, stream.subscribe(target)])
  })
}
