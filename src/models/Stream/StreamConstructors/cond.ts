import { Stream } from 'src/models/Stream/Stream'
import { defer } from 'src/models/Stream/StreamConstructors/defer'
import { empty } from 'src/models/Stream/StreamConstructors/empty'

export function cond<T>(
  condition: () => boolean,
  ifTrue: Stream<T>,
  ifFalse: Stream<T> = empty()
) {
  return defer(() => (condition() ? ifTrue : ifFalse))
}
