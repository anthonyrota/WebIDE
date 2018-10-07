import { IESInteropObservable } from 'src/models/Stream/ESObservable'
import { IInteropStream, isInteropStream } from 'src/models/Stream/Stream'
import { fromArray } from 'src/models/Stream/StreamConstructors/fromArray'
import { fromAsyncIterable } from 'src/models/Stream/StreamConstructors/fromAsyncIterable'
import { fromIterable } from 'src/models/Stream/StreamConstructors/fromIterable'
import { fromObservable } from 'src/models/Stream/StreamConstructors/fromObservable'
import { fromPromise } from 'src/models/Stream/StreamConstructors/fromPromise'
import { isArrayLike } from 'src/utils/isArrayLike'
import { isAsyncIterable } from 'src/utils/isAsyncIterable'
import { isESInteropObservable } from 'src/utils/isESInteropObservable'
import { isIterable } from 'src/utils/isIterable'
import { isPromiseLike } from 'src/utils/isPromiseLike'

export function from<T>(
  input:
    | ArrayLike<T>
    | IInteropStream<T>
    | Iterable<T>
    | AsyncIterable<T>
    | IESInteropObservable<T>
    | PromiseLike<T>
) {
  if (isInteropStream(input)) {
    return input
  } else if (isArrayLike(input)) {
    return fromArray(input)
  } else if (isIterable(input)) {
    return fromIterable(input)
  } else if (isAsyncIterable(input)) {
    return fromAsyncIterable(input)
  } else if (isESInteropObservable(input)) {
    return fromObservable(input)
  } else if (isPromiseLike(input)) {
    return fromPromise(input)
  } else {
    throw new TypeError(
      'Invalid input. The input is neither ArrayLike, a Stream, an Iterable, an AsyncIterable, an ES Compatible Observable or a Promise'
    )
  }
}
