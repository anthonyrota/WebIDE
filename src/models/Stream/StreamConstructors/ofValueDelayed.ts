import { RawStream, Stream } from 'src/models/Stream/Stream'
import { setTimeout } from 'src/utils/setTimeout'

export function ofValueDelayed<T>(value: T, delay: number): Stream<T> {
  return new RawStream<T>(target => {
    return setTimeout(() => {
      target.next(value)
    }, delay)
  })
}
