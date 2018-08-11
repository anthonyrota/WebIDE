import { RawStream, Stream } from 'src/models/Stream/Stream'

export function ofValue<T>(value: T): Stream<T> {
  return new RawStream<T>(target => {
    target.next(value)
  })
}
