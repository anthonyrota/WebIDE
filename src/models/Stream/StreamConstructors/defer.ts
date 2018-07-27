import { RawStream, Stream } from 'src/models/Stream/Stream'

export function defer<T>(createStream: () => Stream<T>): Stream<T> {
  return new RawStream<T>(target => {
    return createStream().subscribe(target)
  })
}
