import { Operation, transform } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { startNextOnErrorOrComplete } from '../StreamConstructors/startNextOnErrorOrComplete'

export function startNextOnErrorOrCompleteWith<T>(
  ...sources: Array<Stream<T>>
): Operation<T, T> {
  return transform(source => startNextOnErrorOrComplete(source, ...sources))
}
