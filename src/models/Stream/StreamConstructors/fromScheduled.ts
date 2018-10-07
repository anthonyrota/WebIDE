import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { IESInteropObservable } from 'src/models/Stream/ESObservable'
import { IInteropStream, isInteropStream } from 'src/models/Stream/Stream'
import { fromArrayScheduled } from 'src/models/Stream/StreamConstructors/fromArrayScheduled'
import { fromAsyncIterableScheduled } from 'src/models/Stream/StreamConstructors/fromAsyncIterableScheduled'
import { fromIterableScheduled } from 'src/models/Stream/StreamConstructors/fromIterableScheduled'
import { fromObservableScheduled } from 'src/models/Stream/StreamConstructors/fromObservableScheduled'
import { fromPromiseScheduled } from 'src/models/Stream/StreamConstructors/fromPromiseScheduled'
import { fromStreamScheduled } from 'src/models/Stream/StreamConstructors/fromStreamScheduled'
import { isArrayLike } from 'src/utils/isArrayLike'
import { isAsyncIterable } from 'src/utils/isAsyncIterable'
import { isESInteropObservable } from 'src/utils/isESInteropObservable'
import { isIterable } from 'src/utils/isIterable'
import { isPromiseLike } from 'src/utils/isPromiseLike'

export function fromScheduled<T>(
  input:
    | ArrayLike<T>
    | IInteropStream<T>
    | Iterable<T>
    | AsyncIterable<T>
    | IESInteropObservable<T>
    | PromiseLike<T>,
  scheduler: IScheduler,
  delay?: number
) {
  if (isInteropStream(input)) {
    return fromStreamScheduled(input, scheduler, delay)
  } else if (isArrayLike(input)) {
    return fromArrayScheduled(input, scheduler, delay)
  } else if (isIterable(input)) {
    return fromIterableScheduled(input, scheduler, delay)
  } else if (isAsyncIterable(input)) {
    return fromAsyncIterableScheduled(input, scheduler, delay)
  } else if (isESInteropObservable(input)) {
    return fromObservableScheduled(input, scheduler, delay)
  } else if (isPromiseLike(input)) {
    return fromPromiseScheduled(input, scheduler, delay)
  } else {
    throw new TypeError(
      'Invalid input. The input is neither ArrayLike, a Stream, an Iterable, an AsyncIterable, an ES Compatible Observable or a Promise'
    )
  }
}
