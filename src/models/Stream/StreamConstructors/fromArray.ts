import { RawStream, Stream } from 'src/models/Stream/Stream'

export function fromArray<T>(array: ArrayLike<T>): Stream<T> {
  return new RawStream<T>(target => {
    for (let i = 0; i < array.length; i++) {
      target.next(array[i])
    }
    target.complete()
  })
}
