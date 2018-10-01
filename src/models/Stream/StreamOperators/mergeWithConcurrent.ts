import { Operation, transform } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { mergeConcurrent } from 'src/models/Stream/StreamConstructors/mergeConcurrent'

export function mergeWithConcurrent<T>(
  streams: Array<Stream<T>>,
  concurrency: number
): Operation<T, T> {
  return transform(source => mergeConcurrent([source, ...streams], concurrency))
}
