import { RawStream, Stream } from 'src/models/Stream/Stream'

export function fromPromise<T>(promise: PromiseLike<T>): Stream<T> {
  return new RawStream<T>(target => {
    promise.then(
      value => {
        target.next(value)
        target.complete()
      },
      error => {
        target.error(error)
      }
    )
  })
}
