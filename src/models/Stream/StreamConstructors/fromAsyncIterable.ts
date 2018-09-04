import { RawStream, Stream } from 'src/models/Stream/Stream'
import { getAsyncIteratorSymbol } from 'src/utils/asyncIteratorSymbol'

export function fromAsyncIterable<T>(iterable: AsyncIterable<T>): Stream<T> {
  return new RawStream<T>(target => {
    const iterator = iterable[getAsyncIteratorSymbol()]()

    function getNext() {
      if (!target.isReceivingValues()) {
        return
      }

      let resultPromise: Promise<IteratorResult<T>>

      try {
        resultPromise = iterator.next()
      } catch (error) {
        target.error(error)
        return
      }

      resultPromise.then(
        result => {
          if (result.done) {
            target.complete()
          } else {
            target.next(result.value)
            getNext()
          }
        },
        error => {
          target.error(error)
        }
      )
    }

    getNext()
  })
}
