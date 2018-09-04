import { RawStream, Stream } from 'src/models/Stream/Stream'
import { getIteratorSymbol } from 'src/utils/iteratorSymbol'

export function fromIterable<T>(iterable: Iterable<T>): Stream<T> {
  return new RawStream<T>(target => {
    const iterator = iterable[getIteratorSymbol()]()

    while (target.isReceivingValues()) {
      let result: IteratorResult<T>

      try {
        result = iterator.next()
      } catch (error) {
        target.error(error)
        return
      }

      if (result.done) {
        target.complete()
        break
      }

      target.next(result.value)
    }
  })
}
