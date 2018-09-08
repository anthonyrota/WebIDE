import { Stream } from 'src/models/Stream/Stream'
import { fromArray } from 'src/models/Stream/StreamConstructors/fromArray'
import { mergeAllConcurrent } from 'src/models/Stream/StreamOperators/mergeAllConcurrent'

export function mergeConcurrent<T>(
  sources: Array<Stream<T>>,
  concurrency: number
): Stream<T> {
  return fromArray(sources).lift(mergeAllConcurrent(concurrency))
}
