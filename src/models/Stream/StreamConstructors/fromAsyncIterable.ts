import { RawStream, Stream } from 'src/models/Stream/Stream'
import { $$asyncIterator } from 'src/utils/asyncIteratorSymbol'

export function fromAsyncIterable<T>(iterable: AsyncIterable<T>): Stream<T> {
  return new RawStream<T>(target => {
    const iterator = iterable[$$asyncIterator]()

    function getNext() {
      if (target.isDisposed) {
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
