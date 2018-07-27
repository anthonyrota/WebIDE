import { RawStream, Stream } from 'src/models/Stream/Stream'
import { asyncReportError } from 'src/utils/asyncReportError'

export function fromPromise<T>(promise: PromiseLike<T>): Stream<T> {
  return new RawStream<T>(target => {
    promise
      .then(
        value => {
          target.next(value)
          target.complete()
        },
        error => {
          target.error(error)
        }
      )
      .then(null, asyncReportError)
  })
}
